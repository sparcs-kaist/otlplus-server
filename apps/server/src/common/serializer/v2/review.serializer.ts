import { IReviewV2 } from '@otl/server-nest/common/interfaces/v2'
import { session_userprofile } from '@prisma/client'

import { EReview } from '@otl/prisma-client/entities'

export const toJsonReviewV2 = (
  review: EReview.Extended,
  user?: session_userprofile | null,
  language: string = 'ko',
): IReviewV2.Basic => {
  let isLiked = false
  if (user && review.review_reviewvote) {
    isLiked = !!review.review_reviewvote.find((reviewvote) => reviewvote.userprofile_id === user.id)
  }

  const professors = review.lecture.subject_lecture_professors.map((x) => ({
    id: x.professor.professor_id,
    name:
      language.includes('en') && x.professor.professor_name_en
        ? x.professor.professor_name_en
        : x.professor.professor_name,
  }))

  return {
    id: review.id,
    courseId: review.course.id,
    courseName: language.includes('en') && review.course.title_en ? review.course.title_en : review.course.title,
    lectureId: review.lecture.id,
    professors,
    year: review.lecture.year,
    semester: review.lecture.semester,
    content: review.is_deleted ? '관리자에 의해 삭제된 코멘트입니다.' : review.content,
    like: Math.round(review.like),
    grade: Math.round(review.grade),
    load: Math.round(review.load),
    speech: Math.round(review.speech),
    isDeleted: !!review.is_deleted,
    likedByUser: isLiked,
  }
}
