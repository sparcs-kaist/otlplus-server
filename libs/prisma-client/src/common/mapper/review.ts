import { ReviewBasic, ReviewWithLecture } from '@otl/server-nest/modules/reviews/domain/review'

import { mapLecture } from '@otl/prisma-client/common/mapper/lecture'
import { EReview } from '@otl/prisma-client/entities'

export function mapReview(review: EReview.Basic): ReviewBasic {
  return {
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
}

export function mapReviewWithLecture(review: EReview.WithLectures): ReviewWithLecture {
  return {
    ...mapReview(review),
    lecture: mapLecture(review.lecture),
  }
}
