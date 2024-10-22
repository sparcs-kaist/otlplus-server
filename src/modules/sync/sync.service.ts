import { Injectable } from '@nestjs/common';
import { ECourse } from '@src/common/entities/ECourse';
import { EDepartment } from '@src/common/entities/EDepartment';
import { ELecture } from '@src/common/entities/ELecture';
import { ISync } from 'src/common/interfaces/ISync';
import { SyncRepository } from 'src/prisma/repositories/sync.repository';

@Injectable()
export class SyncService {
  constructor(private readonly syncRepository: SyncRepository) {}

  async getDefaultSemester() {
    return await this.syncRepository.getDefaultSemester();
  }

  async syncScholarDB(data: ISync.ScholarDBData) {
    const result: any = {
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
          continue;
        }

        if (this.departmentChanged(foundDepartment, departmentInfo)) {
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
          continue;
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

    /// Lecture update
    const lecturesNonexist = new Set(existingLectures.map((l) => l.id));
    const existingProfessors =
      await this.syncRepository.getExistingProfessorsById(
        data.charges.map((c) => c.prof_id),
      );
    const professorMap = new Map(
      existingProfessors.map((p) => [p.professor_id, p]),
    );
    for (const lecture of data.lectures) {
      const foundLecture = existingLectures.find(
        (l) =>
          l.code === lecture.subject_no &&
          l.class_no === lecture.lecture_class.trim(),
      );
      if (foundLecture) {
        lecturesNonexist.delete(foundLecture.id);
        const course_id = courseMap.get(lecture.old_no)?.id;
        if (!course_id) {
          throw new Error(`Course not found for lecture ${lecture.subject_no}`);
        }
        if (this.lectureChanged(foundLecture, lecture, { course_id })) {
          const updatedLecture = await this.syncRepository.updateLecture(
            foundLecture.id,
            {
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
            },
          );
          result.lectures.updated.push([foundLecture, updatedLecture]);
          const { added, removedIds } = this.lectureProfessorsChanges(
            foundLecture,
            data.charges.filter(
              (c) =>
                c.lecture_year === lecture.lecture_year &&
                c.lecture_term === lecture.lecture_term &&
                c.subject_no === lecture.subject_no &&
                c.lecture_class === lecture.lecture_class,
            ),
          );
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
          );

          await this.syncRepository.updateLectureProfessors(
            foundLecture.id,
            professorChanges,
          );
        }
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

  lectureChanged(
    lecture: ELecture.Details,
    newData: ISync.ScholarLectureType,
    { course_id }: { course_id: number },
  ) {
    return (
      lecture.department_id !== newData.dept_id ||
      lecture.old_code !== newData.old_no ||
      lecture.title !== newData.sub_title ||
      lecture.title_en !== newData.e_sub_title ||
      lecture.type !== newData.subject_type ||
      lecture.type_en !== newData.e_subject_type ||
      lecture.audience !== newData.course_sect ||
      lecture.limit !== newData.limit ||
      lecture.credit !== newData.credit ||
      lecture.credit_au !== newData.act_unit ||
      lecture.num_classes !== newData.lecture ||
      lecture.num_labs !== newData.lab ||
      lecture.is_english !== (newData.english_lec === 'Y') ||
      lecture.course_id !== course_id
    );
  }

  lectureProfessorsChanges(
    lecture: ELecture.Details,
    charges: ISync.ScholarChargeType[],
  ): { added: ISync.ScholarChargeType[]; removedIds: number[] } {
    const added = charges.filter(
      (charge) =>
        !lecture.subject_lecture_professors.find(
          (p) => p.professor.id === charge.prof_id,
        ),
    );
    const removedIds = lecture.subject_lecture_professors
      .filter(
        (p) => !charges.find((charge) => charge.prof_id === p.professor.id),
      )
      .map((p) => p.professor.id);
    return { added, removedIds };
  }
}
