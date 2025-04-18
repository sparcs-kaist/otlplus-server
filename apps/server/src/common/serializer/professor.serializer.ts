import { subject_professor } from '@prisma/client';
import { IProfessor } from '@otl/server-nest/common/interfaces';

export const toJsonProfessors = (professors: subject_professor[], nested = false): IProfessor.Basic[] => {
  const result = professors.map((professor) => {
    return {
      name: professor.professor_name,
      name_en: professor.professor_name_en ?? '',
      professor_id: professor.professor_id,
      review_total_weight: professor.review_total_weight + 0.000001,
    };
  });

  if (nested) {
    return result;
  }

  return result.map((professor) => {
    return professor; //todo: add necessary infos
  });
};
