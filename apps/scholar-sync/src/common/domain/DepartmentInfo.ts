import { ISync } from '@otl/api-interface/dist/src/interfaces/ISync';
import { EDepartment } from '@otl/api-interface/dist/src';

export class DepartmentInfo {
  id: number;
  num_id: string;
  code: string;
  name: string;
  name_en: string;

  public static deriveDepartmentInfo(lecture: ISync.ScholarLectureType): DepartmentInfo {
    return {
      id: lecture.DEPT_ID,
      num_id: lecture.SUBJECT_NO.split('.')[0], // TODO: num_id is obsolete. It equals code, and should be removed later.
      code: this.extract_dept_code(lecture.SUBJECT_NO), // TODO: May need to extract from new SUBJECT_NO
      name: lecture.DEPT_NAME,
      name_en: lecture.E_DEPT_NAME,
    };
  }
  private static extract_dept_code(lectureCode: string) {
    const code = lectureCode.match(/[a-zA-Z]+|\d+/g)?.[0];
    if (!code) throw new Error(`Failed to extract department code from ${lectureCode}`);
    return code;
  }

  public static equals(department: DepartmentInfo, existing: EDepartment.Basic) {
    return (
      existing.num_id == department.num_id &&
      existing.code == department.code &&
      existing.name == department.name &&
      existing.name_en == department.name_en
    );
  }
}
