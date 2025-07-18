import { LectureRelationMap } from '@otl/server-nest/modules/lectures/domain/lecture'
import { ProfessorScore, ProfessorWithRelations } from '@otl/server-nest/modules/professor/domain/professor'

import { mapDepartment } from '@otl/prisma-client/common/mapper/department'
import { EDepartment, EProfessor } from '@otl/prisma-client/entities'

const relationPrismaToDomainMap = {} as const
type RelationPrismaToDomainMap = typeof relationPrismaToDomainMap

type IncludedRelations<T extends EProfessor.Basic> = {
  [K in keyof T & keyof RelationPrismaToDomainMap]: NonNullable<T[K]> extends object
    ? RelationPrismaToDomainMap[K]
    : never
}[keyof T & keyof RelationPrismaToDomainMap]

const relationMappers = {
  subject_department: (department: EDepartment.Basic) => mapDepartment(department),
}

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

export function mapProfessor<T extends EProfessor.Basic>(professor: T): ProfessorWithRelations<IncludedRelations<T>> {
  const base = {
    id: professor.id,
    professorName: professor.professor_name,
    professorNameEn: professor.professor_name_en,
    professorId: professor.professor_id,
    major: professor.major != null && !Number.isNaN(Number(professor.major)) ? Number(professor.major) : null,
    score: mapProfessorScore(professor),
  }
  const withRelations = { ...base } as Partial<LectureRelationMap>

  Object.keys(relationMappers).forEach((key) => {
    if (key in professor && professor[key as keyof T]) {
      const domainKey = relationPrismaToDomainMap[key as keyof RelationPrismaToDomainMap]

      const mapper = relationMappers[key as keyof typeof relationMappers]

      const relationObject = professor[key as keyof T];
      (withRelations as any)[domainKey] = mapper(relationObject as any)
    }
  })
  return withRelations as ProfessorWithRelations<IncludedRelations<T>>
}
