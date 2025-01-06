import { Injectable } from '@nestjs/common';
import { ECourse } from '@src/common/entities/ECourse';
import { EDepartment } from '@src/common/entities/EDepartment';
import { ELecture } from '@src/common/entities/ELecture';
import { EProfessor } from '@src/common/entities/EProfessor';
import { ISync } from 'src/common/interfaces/ISync';
import { SyncRepository } from 'src/prisma/repositories/sync.repository';
import { SlackNotiService } from './slackNoti.service';
import {
  ChargeDerivedProfessorInfo,
  DerivedClasstimeInfo,
  DerivedExamtimeInfo,
  DerivedLectureInfo,
  LectureDerivedCourseInfo,
  LectureDerivedDepartmentInfo,
} from './types';

@Injectable()
export class SyncScholarDBService {
  constructor(
    private readonly syncRepository: SyncRepository,
    private readonly slackNoti: SlackNotiService,
  ) {}

  async getDefaultSemester() {
    return await this.syncRepository.getDefaultSemester();
  }

  async syncScholarDB(data: ISync.ScholarDBBody) {
    this.slackNoti.sendSyncNoti(
      `syncScholarDB ${data.year}-${data.semester}: ${data.lectures.length} lectures, ${data.charges.length} charges`,
    );
    const result: any = {
      time: new Date().toISOString(),
      departments: {
        created: [],
        updated: [],
        errors: [],
      },
      courses: {
        created: [],
        updated: [],
        errors: [],
      },
      professors: {
        created: [],
        updated: [],
        errors: [],
      },
      lectures: {
        created: [],
        updated: [],
        chargeUpdated: [],
        deleted: [],
        errors: [],
      },
    };

    const staffProfessor =
      await this.syncRepository.getOrCreateStaffProfessor();

    /// Department update
    /**
     * Temporary Comment out
     * 모든 Department ID가 다 바뀌었는데 어떻게 바뀌었는지 모름.
     * 일단 1/3일 타겟까지는 업데이트하지말고 수강신청 기간 이후에 적절히 수동으로 바꿔줄 수 있도록 할 예정
     **/
    const existingDepartments =
      await this.syncRepository.getExistingDepartments();
    const departmentMap: Record<number, EDepartment.Basic> = Object.fromEntries(
      existingDepartments.map((dept) => [dept.id, dept]),
    );
    this.slackNoti.sendSyncNoti(
      `Found ${existingDepartments.length} existing departments, updating...`,
    );
    const processedDepartmentIds = new Set<number>();
    for (const lecture of data.lectures) {
      try {
        if (processedDepartmentIds.has(lecture.DEPT_ID)) continue; // skip if already processed
        processedDepartmentIds.add(lecture.DEPT_ID);

        const departmentInfo = this.deriveDepartmentInfo(lecture);
        const foundDepartment = departmentMap[lecture.DEPT_ID];

        // No department found, create new department
        if (!foundDepartment) {
          const newDept =
            await this.syncRepository.createDepartment(departmentInfo);
          departmentMap[newDept.id] = newDept;
          result.departments.created.push(newDept);

          const deptsToMakeInvisible = existingDepartments.filter(
            (l) => l.code === newDept.code && l.visible,
          );
          await Promise.all(
            deptsToMakeInvisible.map((l) =>
              this.syncRepository.updateDepartment(l.id, { visible: false }),
            ),
          );
        } else if (this.departmentChanged(foundDepartment, departmentInfo)) {
          const updated = await this.syncRepository.updateDepartment(
            foundDepartment.id,
            {
              num_id: departmentInfo.num_id,
              code: departmentInfo.code,
              name: departmentInfo.name,
              name_en: departmentInfo.name_en,
            },
          );
          departmentMap[foundDepartment.id] = updated;
          result.departments.updated.push([foundDepartment, updated]);
        }
      } catch (e: any) {
        result.departments.errors.push({
          dept_id: lecture.DEPT_ID,
          error: e.message || 'Unknown error',
        });
      }
    }
    this.slackNoti.sendSyncNoti(
      `Department created: ${result.departments.created.length}, updated: ${result.departments.updated.length}, errors: ${result.departments.errors.length}`,
    );

    /// Course update
    const lectureByCode = new Map(
      data.lectures.map((l) => [l.OLD_NO, l] as const), // TODO: OLD_NO may not be available later, need to change to use new code
    );
    const existingCourses =
      await this.syncRepository.getExistingCoursesByOldCodes(
        Array.from(lectureByCode.keys()),
      );
    this.slackNoti.sendSyncNoti(
      `Found ${existingCourses.length} existing related courses, updating...`,
    );
    const courseMap = new Map(
      existingCourses.map((l) => [l.old_code, l] as const),
    );
    for (const [old_code, lecture] of lectureByCode.entries()) {
      try {
        const foundCourse = courseMap.get(old_code);
        const derivedCourse = this.deriveCourseInfo(lecture);
        if (!foundCourse) {
          const newCourse =
            await this.syncRepository.createCourse(derivedCourse);
          result.courses.created.push(newCourse);
          courseMap.set(old_code, newCourse);
        } else {
          if (this.courseChanged(foundCourse, derivedCourse)) {
            const updatedCourse = await this.syncRepository.updateCourse(
              foundCourse.id,
              derivedCourse,
            );
            result.courses.updated.push([foundCourse, updatedCourse]);
            courseMap.set(old_code, updatedCourse);
          }
        }
      } catch (e: any) {
        result.courses.errors.push({
          old_code,
          error: e.message || 'Unknown error',
        });
      }
    }
    this.slackNoti.sendSyncNoti(
      `Course created: ${result.courses.created.length}, updated: ${result.courses.updated.length}, errors: ${result.courses.errors.length}`,
    );

    // Professor update
    const existingProfessors =
      await this.syncRepository.getExistingProfessorsById(
        data.charges.map((c) => c.PROF_ID),
      );
    const professorMap = new Map(
      existingProfessors.map((p) => [p.professor_id, p]),
    );
    this.slackNoti.sendSyncNoti(
      `Found ${existingProfessors.length} existing related professors, updating...`,
    );
    const processedProfessorIds = new Set<number>();
    for (const charge of data.charges) {
      try {
        // TODO: 아래 로직 변경 필요할 수 있음? id는 staff id인데 실제 강사 이름이 들어있음. 데이터에서 staff id 830으로 확인 바람.
        // 기존 코드에서도 이렇게 처리하고 있었음.
        // staff id인 경우 이름이 각자 다를 수 있다는 것임.
        if (charge.PROF_ID === staffProfessor.professor_id) continue;
        if (processedProfessorIds.has(charge.PROF_ID)) continue;
        processedProfessorIds.add(charge.PROF_ID);

        const professor = professorMap.get(charge.PROF_ID);
        const derivedProfessor = this.deriveProfessorInfo(charge);

        if (!professor) {
          const newProfessor =
            await this.syncRepository.createProfessor(derivedProfessor);
          professorMap.set(charge.PROF_ID, newProfessor);
          result.professors.created.push(newProfessor);
        } else if (this.professorChanged(professor, derivedProfessor)) {
          const updatedProfessor = await this.syncRepository.updateProfessor(
            professor.id,
            derivedProfessor,
          );
          professorMap.set(charge.PROF_ID, updatedProfessor);
          result.professors.updated.push([professor, updatedProfessor]);
        }
      } catch (e: any) {
        result.professors.errors.push({
          prof_id: charge.PROF_ID,
          error: e.message || 'Unknown error',
        });
      }
    }
    this.slackNoti.sendSyncNoti(
      `Professor created: ${result.professors.created.length}, updated: ${result.professors.updated.length}, errors: ${result.professors.errors.length}`,
    );

    /// Lecture update
    const existingLectures =
      await this.syncRepository.getExistingDetailedLectures({
        year: data.year,
        semester: data.semester,
      });
    this.slackNoti.sendSyncNoti(
      `Found ${existingLectures.length} existing lectures, updating...`,
    );
    const notExistingLectures = new Set(existingLectures.map((l) => l.id));
    for (const lecture of data.lectures) {
      try {
        const foundLecture = existingLectures.find(
          (l) =>
            l.old_code === lecture.OLD_NO &&
            l.class_no.trim() === lecture.LECTURE_CLASS.trim(),
        );
        const course_id = courseMap.get(lecture.OLD_NO)?.id;
        if (!course_id)
          throw new Error(`Course not found for lecture ${lecture.SUBJECT_NO}`);
        const derivedLecture = this.deriveLectureInfo(lecture, course_id);
        const professorCharges = data.charges.filter(
          (c) =>
            c.LECTURE_YEAR === lecture.LECTURE_YEAR &&
            c.LECTURE_TERM === lecture.LECTURE_TERM &&
            c.SUBJECT_NO === lecture.SUBJECT_NO &&
            c.LECTURE_CLASS.trim() === lecture.LECTURE_CLASS.trim(),
        );

        if (foundLecture) {
          notExistingLectures.delete(foundLecture.id);
          if (this.lectureChanged(foundLecture, derivedLecture)) {
            const updatedLecture = await this.syncRepository.updateLecture(
              foundLecture.id,
              derivedLecture,
            );
            result.lectures.updated.push([foundLecture, updatedLecture]);
          }
          const { addedIds, removedIds } = this.lectureProfessorsChanges(
            foundLecture,
            professorCharges,
            professorMap,
          );

          if (addedIds.length || removedIds.length) {
            await this.syncRepository.updateLectureProfessors(foundLecture.id, {
              added: addedIds,
              removed: removedIds,
            });
            result.lectures.chargeUpdated.push({
              lecture: foundLecture,
              added: addedIds.map((id) => professorMap.get(id)),
              removed: removedIds.map((id) => professorMap.get(id) || { id }),
            });
          }
        } else {
          const newLecture =
            await this.syncRepository.createLecture(derivedLecture);
          const addedIds = professorCharges.map(
            (charge) => professorMap.get(charge.PROF_ID)!.id,
          );

          await this.syncRepository.updateLectureProfessors(newLecture.id, {
            added: addedIds,
            removed: [],
          });
          result.lectures.created.push({ ...newLecture, professors: addedIds });
        }
      } catch (e: any) {
        result.lectures.errors.push({
          lecture: {
            code: lecture.SUBJECT_NO,
            class_no: lecture.LECTURE_CLASS,
          },
          error: e.message || 'Unknown error',
        });
      }
    }

    // Remove not existing lectures
    try {
      await this.syncRepository.markLecturesDeleted(
        Array.from(notExistingLectures),
      );
      result.lectures.deleted = Array.from(notExistingLectures);
    } catch (e: any) {
      result.lectures.errors.push({
        lecturesToDelete: Array.from(notExistingLectures),
        error: e.message || 'Unknown error',
      });
    }

    this.slackNoti.sendSyncNoti(
      `Lecture created: ${result.lectures.created.length}, updated: ${result.lectures.updated.length}, errors: ${result.lectures.errors.length}`,
    );

    return result;
  }

  deriveDepartmentInfo(
    lecture: ISync.ScholarLectureType,
  ): LectureDerivedDepartmentInfo {
    return {
      id: lecture.DEPT_ID,
      num_id: lecture.SUBJECT_NO.split('.')[0], // TODO: num_id is obsolete. It equals code, and should be removed later.
      code: this.extract_dept_code(lecture.OLD_NO), // TODO: May need to extract from new SUBJECT_NO
      name: lecture.DEPT_NAME,
      name_en: lecture.E_DEPT_NAME,
    };
  }

  extract_dept_code(lectureCode: string) {
    const code = lectureCode.match(/([a-zA-Z]+)(\d+)/)?.[1];
    if (!code)
      throw new Error(`Failed to extract department code from ${lectureCode}`);
    return code;
  }

  departmentChanged(
    dept: EDepartment.Basic,
    newData: LectureDerivedDepartmentInfo,
  ) {
    return (
      dept.num_id !== newData.num_id ||
      dept.code !== newData.code ||
      dept.name !== newData.name ||
      dept.name_en !== newData.name_en
    );
  }

  deriveCourseInfo(
    lecture: ISync.ScholarLectureType,
  ): LectureDerivedCourseInfo {
    return {
      old_code: lecture.OLD_NO,
      new_code: lecture.SUBJECT_NO,
      department_id: lecture.DEPT_ID,
      type: lecture.SUBJECT_TYPE,
      type_en: lecture.E_SUBJECT_TYPE,
      title: lecture.SUB_TITLE.split('<')[0].split('[')[0].trim(),
      title_en: lecture.E_SUB_TITLE.split('<')[0].split('[')[0].trim(),
    };
  }

  courseChanged(course: ECourse.Basic, newData: LectureDerivedCourseInfo) {
    return (
      course.department_id !== newData.department_id ||
      course.type !== newData.type ||
      course.type_en !== newData.type_en ||
      course.title !== newData.title ||
      course.title_en !== newData.title_en
    );
  }

  deriveProfessorInfo(
    charge: ISync.ScholarChargeType,
  ): ChargeDerivedProfessorInfo {
    return {
      professor_id: charge.PROF_ID,
      professor_name: charge.PROF_NAME.trim(),
      professor_name_en: charge.E_PROF_NAME?.trim() || '',
      major: charge.DEPT_ID.toString(),
    };
  }

  professorChanged(
    professor: EProfessor.Basic,
    newData: ChargeDerivedProfessorInfo,
  ) {
    return (
      professor.professor_name !== newData.professor_name ||
      professor.professor_name_en !== newData.professor_name_en ||
      professor.major !== newData.major
    );
  }

  deriveLectureInfo(
    lecture: ISync.ScholarLectureType,
    course_id: number,
  ): DerivedLectureInfo {
    return {
      code: lecture.SUBJECT_NO,
      new_code: lecture.SUBJECT_NO,
      year: lecture.LECTURE_YEAR,
      semester: lecture.LECTURE_TERM,
      class_no: lecture.LECTURE_CLASS.trim(),
      department_id: lecture.DEPT_ID,
      old_code: lecture.OLD_NO,
      title: lecture.SUB_TITLE,
      title_en: lecture.E_SUB_TITLE,
      type: lecture.SUBJECT_TYPE,
      type_en: lecture.E_SUBJECT_TYPE,
      audience: lecture.COURSE_SECT,
      limit: lecture.LIMIT,
      credit: lecture.CREDIT,
      credit_au: lecture.ACT_UNIT,
      num_classes: lecture.LECTURE,
      num_labs: lecture.LAB,
      is_english: lecture.ENGLISH_LEC === 'Y',
      course_id,
    };
  }

  lectureChanged(lecture: ELecture.Details, newData: DerivedLectureInfo) {
    return (
      lecture.code !== newData.code || // TODO: This can be problematic if multiple lectures have the same old code
      lecture.year !== newData.year ||
      lecture.semester !== newData.semester ||
      lecture.class_no !== newData.class_no ||
      lecture.department_id !== newData.department_id ||
      lecture.old_code !== newData.old_code ||
      lecture.title !== newData.title ||
      lecture.title_en !== newData.title_en ||
      lecture.type !== newData.type ||
      lecture.type_en !== newData.type_en ||
      lecture.audience !== newData.audience ||
      lecture.limit !== newData.limit ||
      lecture.credit !== newData.credit ||
      lecture.credit_au !== newData.credit_au ||
      lecture.num_classes !== newData.num_classes ||
      lecture.num_labs !== newData.num_labs ||
      lecture.is_english !== newData.is_english ||
      lecture.course_id !== newData.course_id
    );
  }

  lectureProfessorsChanges(
    lecture: ELecture.Details,
    charges: ISync.ScholarChargeType[],
    professorMap: Map<number, EProfessor.Basic>,
  ): { addedIds: number[]; removedIds: number[] } {
    const addedIds = charges
      .filter(
        (charge) =>
          !lecture.subject_lecture_professors.find(
            (p) => p.professor.professor_id === charge.PROF_ID,
          ),
      )
      .map((charge) => professorMap.get(charge.PROF_ID)!.id);
    const removedIds = lecture.subject_lecture_professors
      .filter(
        (p) =>
          !charges.find(
            (charge) => charge.PROF_ID === p.professor.professor_id,
          ),
      )
      .map((p) => p.professor.id);
    return {
      addedIds: Array.from(new Set(addedIds)),
      removedIds: Array.from(new Set(removedIds)),
    };
  }

  async syncExamtime(data: ISync.ExamtimeBody) {
    return this.syncTime(
      data.year,
      data.semester,
      data.examtimes,
      'examtime',
      this.deriveExamtimeInfo,
      this.examtimeMatches,
    );
  }

  async syncClassTime(data: ISync.ClasstimeBody) {
    return this.syncTime(
      data.year,
      data.semester,
      data.classtimes,
      'classtime',
      this.deriveClasstimeInfo,
      this.classtimeMatches,
    );
  }

  async syncTime<
    TYPE extends 'examtime' | 'classtime',
    T extends TYPE extends 'examtime'
      ? ISync.ExamtimeType
      : ISync.ClasstimeType,
    D extends TYPE extends 'examtime'
      ? DerivedExamtimeInfo
      : DerivedClasstimeInfo,
  >(
    year: number,
    semester: number,
    data: T[],
    type: TYPE,
    deriveInfo: (time: T) => D,
    matches: (derivedTime: D, existingTime: any) => boolean,
  ) {
    this.slackNoti.sendSyncNoti(
      `sync ${type} ${year}-${semester}: ${data.length} ${type}s`,
    );
    const result: any = {
      time: new Date().toISOString(),
      updated: [],
      skipped: [],
      errors: [],
    };

    const existingLectures =
      await this.syncRepository.getExistingDetailedLectures({
        year: year,
        semester: semester,
      });

    this.slackNoti.sendSyncNoti(
      `Found ${existingLectures.length} existing lectures, updating ${type}s...`,
    );

    const lecturePairMap = new Map<number, [ELecture.Details, T[]]>(
      existingLectures.map((l) => [l.id, [l, []]]),
    );

    for (const time of data) {
      const lecture = existingLectures.find(
        (l) =>
          l.code === time.SUBJECT_NO &&
          l.class_no.trim() === time.LECTURE_CLASS.trim(),
      );
      if (!lecture) {
        result.skipped.push({
          subject_no: time.SUBJECT_NO,
          lecture_class: time.LECTURE_CLASS,
          error: 'Lecture not found',
        });
        continue;
      }
      const [, times] = lecturePairMap.get(lecture.id)!;
      times.push(time);
    }

    for (const [lecture, times] of lecturePairMap.values()) {
      try {
        const derivedTimes = times.map(deriveInfo);
        const existingTimes =
          type === 'examtime'
            ? lecture.subject_examtime
            : lecture.subject_classtime;
        const timesToRemove = [];

        for (const existing of existingTimes) {
          const idx = derivedTimes.findIndex((t) => matches(t, existing));
          if (idx === -1) timesToRemove.push(existing.id);
          else derivedTimes.splice(idx, 1); // remove matched time
        }
        const timesToAdd = derivedTimes;
        if (type === 'examtime')
          await this.syncRepository.updateLectureExamtimes(lecture.id, {
            added: timesToAdd,
            removed: timesToRemove,
          });
        else
          await this.syncRepository.updateLectureClasstimes(lecture.id, {
            added: timesToAdd as any,
            removed: timesToRemove,
          });

        if (timesToAdd.length > 0 || timesToRemove.length > 0) {
          result.updated.push({
            lecture: lecture.code,
            class_no: lecture.class_no,
            previous: existingTimes,
            added: timesToAdd,
            removed: timesToRemove,
          });
        }
      } catch (e: any) {
        result.errors.push({
          lecture: {
            code: lecture.code,
            class_no: lecture.class_no,
          },
          error: e.message || 'Unknown error',
        });
      }
    }

    this.slackNoti.sendSyncNoti(
      `${type.charAt(0).toUpperCase() + type.slice(1)} updated: ${
        result.updated.length
      }, skipped: ${result.skipped.length}, errors: ${result.errors.length}`,
    );

    return result;
  }

  deriveExamtimeInfo(examtime: ISync.ExamtimeType): DerivedExamtimeInfo {
    return {
      day: examtime.EXAM_DAY - 1,
      begin: new Date('1970-01-01T' + examtime.EXAM_BEGIN.slice(11) + 'Z'),
      end: new Date('1970-01-01T' + examtime.EXAM_END.slice(11) + 'Z'),
    };
  }

  examtimeMatches(
    examtime: DerivedExamtimeInfo,
    existing: ELecture.Details['subject_examtime'][number],
  ) {
    return (
      examtime.day === existing.day &&
      examtime.begin.getHours() === existing.begin.getHours() &&
      examtime.begin.getMinutes() === existing.begin.getMinutes()
    );
  }

  deriveClasstimeInfo(classTime: ISync.ClasstimeType): DerivedClasstimeInfo {
    return {
      day: this.timeDayConverter(classTime.LECTURE_DAY),
      begin: new Date('1970-01-01T' + classTime.LECTURE_BEGIN.slice(11) + 'Z'),
      end: new Date('1970-01-01T' + classTime.LECTURE_END.slice(11) + 'Z'),
      type: classTime.LECTURE_TYPE,
      building_id: classTime.BUILDING.toString(),
      room_name: classTime.ROOM_NO,
      building_full_name: `(${classTime.BUILDING})${classTime.ROOM_K_NAME}`,
      building_full_name_en: `(${classTime.BUILDING})${classTime.ROOM_E_NAME}`,
      unit_time: classTime.TEACHING,
    };
  }

  private timeDayConverter(dayNumber: number) {
    if (dayNumber < 1 || dayNumber > 7) {
      throw new Error('Invalid day number. Must be between 1 and 7.');
    }

    const day = dayNumber === 1 ? 7 : dayNumber - 1;
    return day - 1;
  }

  classtimeMatches(
    classtime: DerivedClasstimeInfo,
    existing: ELecture.Details['subject_classtime'][number],
  ) {
    return (
      classtime.day === existing.day &&
      classtime.begin.getHours() === existing.begin.getHours() &&
      classtime.begin.getMinutes() === existing.begin.getMinutes() &&
      classtime.type === existing.type &&
      classtime.building_id === existing.building_id &&
      classtime.room_name === existing.room_name &&
      classtime.building_full_name === existing.building_full_name &&
      classtime.building_full_name_en === existing.building_full_name_en &&
      classtime.unit_time === existing.unit_time
    );
  }
}
