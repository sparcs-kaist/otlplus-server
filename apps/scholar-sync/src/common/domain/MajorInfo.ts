import { IScholar } from '@otl/scholar-sync/clients/scholar/IScholar';
import { EDepartment, EUser } from '@otl/api-interface/src';

export const APPLICATION_TYPE = {
  MAJOR: '복수전공신청',
  MINOR: '부전공신청',
} as const;

export type APPLICATION_TYPE = (typeof APPLICATION_TYPE)[keyof typeof APPLICATION_TYPE];

export class MajorInfo<TYPE extends APPLICATION_TYPE> {
  student_id: string;
  department_name: string;
  department_id: number;
  application_type: TYPE;

  public static deriveMajorInfo<T extends APPLICATION_TYPE>(
    otherMajor: IScholar.ScholarOtherMajorType,
    type: T,
    departmentMap: { [key: string]: EDepartment.Basic },
  ): MajorInfo<T> {
    return {
      student_id: `${otherMajor.STUDENT_ID}`,
      department_name: `${otherMajor.ID}`,
      department_id: departmentMap[otherMajor.ID].id,
      application_type: otherMajor.APPLICATION_TYPE as T,
    };
  }

  static equals<
    T extends APPLICATION_TYPE,
    U extends T extends typeof APPLICATION_TYPE.MAJOR ? EUser.WithMajors : EUser.WithMinors,
  >(majorInfo: MajorInfo<T>[], user: U) {
    const userDepartmentIds =
      'session_userprofile_majors' in user
        ? user.session_userprofile_majors.map((major) => major.department_id).sort()
        : user.session_userprofile_minors.map((minor) => minor.department_id).sort();
    const majorInfoDepartmentIds = majorInfo.map((major) => major.department_id).sort();
    return majorInfoDepartmentIds.every((id, index) => id === userDepartmentIds[index]);
  }
}
