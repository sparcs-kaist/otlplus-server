import { Injectable } from '@nestjs/common';
import { ECourse } from '@src/common/entities/ECourse';
import { EDepartment } from '@src/common/entities/EDepartment';
import { ELecture } from '@src/common/entities/ELecture';
import { EProfessor } from '@src/common/entities/EProfessor';
import { ISync } from 'src/common/interfaces/ISync';
import { SyncRepository } from 'src/prisma/repositories/sync.repository';
import {
  ChargeDerivedProfessorInfo,
  DerivedLectureInfo,
  LectureDerivedCourseInfo,
  LectureDerivedDepartmentInfo,
} from './types';

@Injectable()
export class SyncService {
  constructor(private readonly syncRepository: SyncRepository) {}

  async getDefaultSemester() {
    return await this.syncRepository.getDefaultSemester();
  }

  async syncScholarDB(data: ISync.ScholarDBData) {
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
        errors: [],
      },
    };

    const existingLectures =
      await this.syncRepository.getExistingDetailedLectures({
        year: data.year,
        semester: data.semester,
      });
    const staffProfessor =
      await this.syncRepository.getOrCreateStaffProfessor();
    const existingDepartments =
      await this.syncRepository.getExistingDepartments();
    const departmentMap: Record<number, EDepartment.Basic> = Object.fromEntries(
      existingDepartments.map((dept) => [dept.id, dept]),
    );

    /// Department update
    const processedDepartmentIds = new Set<number>();
    for (const lecture of data.lectures) {
      try {
        if (processedDepartmentIds.has(lecture.dept_id)) continue; // skip if already processed
        processedDepartmentIds.add(lecture.dept_id);

        const departmentInfo = this.deriveDepartmentInfo(lecture);
        const foundDepartment = departmentMap[lecture.dept_id];

        // No department found, create new department
        if (!foundDepartment) {
          const newDept = await this.syncRepository.createDepartment(
            departmentInfo,
          );
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
          dept_id: lecture.dept_id,
          error: e.message || 'Unknown error',
        });
      }
    }

    /// Course update
    const lectureByCode = new Map(
      data.lectures.map((l) => [l.old_no, l] as const),
    );
    const existingCourses =
      await this.syncRepository.getExistingCoursesByOldCodes(
        Array.from(lectureByCode.keys()),
      );
    const courseMap = new Map(
      existingCourses.map((l) => [l.old_code, l] as const),
    );
    for (const [old_code, lecture] of lectureByCode.entries()) {
      try {
        const foundCourse = courseMap.get(old_code);
        const derivedCourse = this.deriveCourseInfo(lecture);
        if (!foundCourse) {
          const newCourse = await this.syncRepository.createCourse(
            derivedCourse,
          );
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

    // Professor update
    const existingProfessors =
      await this.syncRepository.getExistingProfessorsById(
        data.charges.map((c) => c.prof_id),
      );
    const professorMap = new Map(
      existingProfessors.map((p) => [p.professor_id, p]),
    );
    const processedProfessorIds = new Set<number>();
    for (const charge of data.charges) {
      try {
        // TODO: 아래 로직 변경 필요할 수 있음? id는 staff id인데 실제 강사 이름이 들어있음. 데이터에서 staff id 830으로 확인 바람.
        // 기존 코드에서도 이렇게 처리하고 있었음.
        // staff id인 경우 이름이 각자 다를 수 있다는 것임.
        if (charge.prof_id === staffProfessor.professor_id) continue;
        if (processedProfessorIds.has(charge.prof_id)) continue;
        processedProfessorIds.add(charge.prof_id);

        const professor = professorMap.get(charge.prof_id);
        const derivedProfessor = this.deriveProfessorInfo(charge);

        if (!professor) {
          const newProfessor = await this.syncRepository.createProfessor(
            derivedProfessor,
          );
          professorMap.set(charge.prof_id, newProfessor);
          result.professors.created.push(newProfessor);
        } else if (this.professorChanged(professor, derivedProfessor)) {
          const updatedProfessor = await this.syncRepository.updateProfessor(
            professor.id,
            derivedProfessor,
          );
          professorMap.set(charge.prof_id, updatedProfessor);
          result.professors.updated.push([professor, updatedProfessor]);
        }
      } catch (e: any) {
        result.professors.errors.push({
          prof_id: charge.prof_id,
          error: e.message || 'Unknown error',
        });
      }
    }
    /*
    {
      0"lecture_year": 2024,
      1"lecture_term": 1,
      2"subject_no": "35.878",
      3"lecture_class": "B ",
      4"dept_id": 4423,
      5"prof_id": 1131,
      6"prof_name": "유회준",
      7"portion": 3,
      8"e_prof_name": "Hoi-Jun Yoo"
    },
    */
    /*
    await Promise.all(
          added.map((charge) => {
            const professor = professorMap.get(charge.prof_id);
            // TODO: 아래 로직 변경 필요할 수 있음? id는 staff id인데 실제 강사 이름이 들어있음. 데이터에서 staff id 830으로 확인 바람.
            // 기존 코드에서도 이렇게 처리하고 있었음.
            if (charge.prof_id === staffProfessor.professor_id) return;

            if (!professor) {
              return this.syncRepository.createProfessor({
                professor_id: charge.prof_id,
                professor_name: charge.prof_name.trim(),
                professor_name_en: charge.e_prof_name.trim(),
              });
            }
          }),
        );*/

    /// Lecture update
    const notExistingLectures = new Set(existingLectures.map((l) => l.id));
    for (const lecture of data.lectures) {
      try {
        const foundLecture = existingLectures.find(
          (l) =>
            l.code === lecture.subject_no &&
            l.class_no === lecture.lecture_class.trim(),
        );
        const course_id = courseMap.get(lecture.old_no)?.id;
        if (!course_id)
          throw new Error(`Course not found for lecture ${lecture.subject_no}`);
        const derivedLecture = this.deriveLectureInfo(lecture, course_id);
        const professorCharges = data.charges.filter(
          (c) =>
            c.lecture_year === lecture.lecture_year &&
            c.lecture_term === lecture.lecture_term &&
            c.subject_no === lecture.subject_no &&
            c.lecture_class.trim() === lecture.lecture_class.trim(),
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
          );

          if (addedIds.length || removedIds.length)
            await this.syncRepository.updateLectureProfessors(foundLecture.id, {
              added: addedIds,
              removed: removedIds,
            });
        } else {
          const newLecture = await this.syncRepository.createLecture(
            derivedLecture,
          );
          result.lectures.created.push(newLecture);
          const addedIds = professorCharges.map((charge) => charge.prof_id);
          await this.syncRepository.updateLectureProfessors(newLecture.id, {
            added: addedIds,
            removed: [],
          });
        }
      } catch (e: any) {
        result.lectures.errors.push({
          lecture: {
            code: lecture.subject_no,
            class_no: lecture.lecture_class,
          },
          error: e.message || 'Unknown error',
        });
      }
    }
  }

  deriveDepartmentInfo(
    lecture: ISync.ScholarLectureType,
  ): LectureDerivedDepartmentInfo {
    return {
      id: lecture.dept_id,
      num_id: lecture.subject_no.slice(0, 2), // TODO: This will be changed in new API
      code: this.extract_dept_code(lecture.old_no),
      name: lecture.dept_name,
      name_en: lecture.e_dept_name,
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
      old_code: lecture.old_no,
      department_id: lecture.dept_id,
      type: lecture.subject_type,
      type_en: lecture.e_subject_type,
      title: lecture.sub_title.split('<')[0].split('[')[0].trim(),
      title_en: lecture.e_sub_title.split('<')[0].split('[')[0].trim(),
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
      professor_id: charge.prof_id,
      professor_name: charge.prof_name.trim(),
      professor_name_en: charge.e_prof_name?.trim() || '',
      major: charge.dept_id.toString(),
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
      code: lecture.subject_no,
      year: lecture.lecture_year,
      semester: lecture.lecture_term,
      class_no: lecture.lecture_class.trim(),
      department_id: lecture.dept_id,
      old_code: lecture.old_no,
      title: lecture.sub_title,
      title_en: lecture.e_sub_title,
      type: lecture.subject_type,
      type_en: lecture.e_subject_type,
      audience: lecture.course_sect,
      limit: lecture.limit,
      credit: lecture.credit,
      credit_au: lecture.act_unit,
      num_classes: lecture.lecture,
      num_labs: lecture.lab,
      is_english: lecture.english_lec === 'Y',
      course_id,
    };
  }

  lectureChanged(lecture: ELecture.Details, newData: DerivedLectureInfo) {
    return (
      lecture.code !== newData.code ||
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
  ): { addedIds: number[]; removedIds: number[] } {
    const addedIds = charges
      .filter(
        (charge) =>
          !lecture.subject_lecture_professors.find(
            (p) => p.professor.id === charge.prof_id,
          ),
      )
      .map((charge) => charge.prof_id);
    const removedIds = lecture.subject_lecture_professors
      .filter(
        (p) => !charges.find((charge) => charge.prof_id === p.professor.id),
      )
      .map((p) => p.professor.id);
    return { addedIds, removedIds };
  }
}
