import { ProfessorBasic, ProfessorScore } from '@otl/server-nest/modules/professor/domain/professor'

import { EProfessor } from '@otl/prisma-client/entities'

export function mapProfessorScore(professor: EProfessor.Basic): ProfessorScore {
  return {
    gradeSum: professor.grade_sum,
    loadSum: professor.load_sum,
    speechSum: professor.speech_sum,
    reviewTotalWeight: professor.review_total_weight,
    grade: professor.grade,
    load: professor.load,
    speech: professor.speech,
  }
}

export function mapProfessor(professor: EProfessor.Basic): ProfessorBasic {
  return {
    id: professor.id,
    professorName: professor.professor_name,
    professorNameEn: professor.professor_name_en,
    professorId: professor.professor_id,
    major: professor.major != null && !Number.isNaN(Number(professor.major)) ? Number(professor.major) : null,
    score: mapProfessorScore(professor),
  }
}
