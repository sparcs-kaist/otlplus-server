import { Injectable } from '@nestjs/common';
import { EDepartment } from '@src/common/entities/EDepartment';
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
    };

    const existingLectures = await this.syncRepository.getExistingLectures({
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
    }

    /// Lecture update
    const lecturesNonexist = new Set(existingLectures.map((l) => l.id));
    for (const lecture of data.lectures) {
      const foundLecture = existingLectures.find(
        (l) =>
          l.code === lecture.subject_no &&
          l.class_no === lecture.lecture_class.trim(),
      );
    }
  }

  deriveDepartmentInfo(
    lecture: ISync.ScholarLectureType,
  ): LectureDerivedDepartmentInfo {
    return {
      id: lecture.dept_id,
      num_id: lecture.subject_no.slice(0, 2),
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
}
