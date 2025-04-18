import { EUser } from '@otl/prisma-client/entities';
import { IScholar } from '@otl/scholar-sync/clients/scholar/IScholar';

export class DegreeInfo {
  student_no!: string;
  dept_id!: number;

  public static deriveDegreeInfo(student: IScholar.ScholarDegreeType): DegreeInfo {
    return {
      student_no: `${student.STUDENT_NO}`,
      dept_id: student.DEPT_ID,
    };
  }

  public static equals(degree: DegreeInfo, existing: EUser.Basic) {
    return degree.student_no === existing.student_id && degree.dept_id === existing.department_id;
  }
}
