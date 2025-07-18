import { ReviewBasic, ReviewRelationMap, ReviewWithRelations } from '@otl/server-nest/modules/reviews/domain/review'

import { mapCourse } from '@otl/prisma-client/common/mapper/course'
import { mapLecture } from '@otl/prisma-client/common/mapper/lecture'
import { ECourse, ELecture, EReview } from '@otl/prisma-client/entities'

const relationPrismaToDomainMap = {
  course: 'course',
  lecture: 'lecture',
  writer: 'writer',
} as const
type RelationPrismaToDomainMap = typeof relationPrismaToDomainMap

type IncludedRelations<T extends EReview.Basic> = {
  [K in keyof T & keyof RelationPrismaToDomainMap]: NonNullable<T[K]> extends object
    ? RelationPrismaToDomainMap[K]
    : never
}[keyof T & keyof RelationPrismaToDomainMap]

const relationMappers = {
  course: (course: ECourse.Basic) => mapCourse(course),
  lecture: (lecture: ELecture.Basic) => mapLecture(lecture),
}

export function mapReview<T extends EReview.Basic>(review: T): ReviewWithRelations<IncludedRelations<T>> {
  const base: ReviewBasic = {
    lectureId: review.lecture_id,
    courseId: review.course_id,
    writerId: review.writer_id,
    anonymousName: review.writer_label,
    updatedAt: review.updated_datetime,
    likeCnt: review.like,
    isDeleted: review.is_deleted,
    writedAt: review.written_datetime,
    ...review,
  }
  const withRelations = { ...base } as Partial<ReviewRelationMap>

  Object.keys(relationMappers).forEach((key) => {
    if (key in review && review[key as keyof T]) {
      const domainKey = relationPrismaToDomainMap[key as keyof RelationPrismaToDomainMap]

      const mapper = relationMappers[key as keyof typeof relationMappers]

      const relationObject = review[key as keyof T];
      (withRelations as any)[domainKey] = mapper(relationObject as any)
    }
  })
  return withRelations as ReviewWithRelations<IncludedRelations<T>>
}
