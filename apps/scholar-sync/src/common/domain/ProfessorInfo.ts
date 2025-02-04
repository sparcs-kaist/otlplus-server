import { ISync } from '@otl/api-interface/dist/src/interfaces/ISync';
import { EProfessor } from '@otl/api-interface/dist/src';

export class ProfessorInfo {
  professor_id: number;
  professor_name: string;
  professor_name_en: string;
  major: string;

  public static deriveProfessorInfo(charge: ISync.ScholarChargeType): ProfessorInfo {
    return {
      professor_id: charge.PROF_ID,
      professor_name: charge.PROF_NAME.trim(),
      professor_name_en: charge.E_PROF_NAME?.trim() || '',
      major: charge.DEPT_ID.toString(),
    };
  }

  public static equals(existing: EProfessor.Basic, professor: ProfessorInfo) {
    return (
      existing.professor_name !== professor.professor_name &&
      existing.professor_name_en !== professor.professor_name_en &&
      existing.major !== professor.major
    );
  }
}
