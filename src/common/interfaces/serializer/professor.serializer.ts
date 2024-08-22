import { subject_professor } from '@prisma/client';
import { IProfessor } from '../IProfessor';

export const toJsonProfessors = (
  professors: subject_professor[],
  nested = false,
): IProfessor.Basic[] => {
  const result = professors.map((professor) => {
    return {
      name: professor.professor_name,
      name_en: professor.professor_name_en ?? '',
      professor_id: professor.professor_id,
      review_total_weight: professor.review_total_weight,
    };
  });

  if (nested) {
    return result;
  }

  return result.map((professor) => {
    return professor; //todo: add necessary infos
  });
};
