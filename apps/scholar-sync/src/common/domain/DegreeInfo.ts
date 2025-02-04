import { IScholar } from '@otl/scholar-sync/clients/scholar/IScholar';
import { EUser } from '@otl/api-interface/dist/src';

export class DegreeInfo {
  student_no: string;
  dept_id: number;

  public static deriveDegreeInfo(student: IScholar.ScholarDegreeType): DegreeInfo {
    return {
      student_no: `${student.student_no}`,
      dept_id: student.dept_id,
    };
  }

  public static equals(degree: DegreeInfo, existing: EUser.Basic) {
    return degree.student_no === existing.student_id && degree.dept_id === existing.department_id;
  }
}
