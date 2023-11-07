import { subject_professor } from '@prisma/client';
import { ProfessorResponseDto } from '../dto/professor/professor.response.dto';

export const toJsonProfessor = (
  professors: subject_professor[],
  nested = false,
): ProfessorResponseDto[] => {
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
