import { IReview } from '@otl/server-nest/common/interfaces'
import { toJsonDepartment } from '@otl/server-nest/common/serializer/department.serializer'
import { session_userprofile } from '@prisma/client'

import { EReview } from '@otl/prisma-client/entities'

import { toJsonLectureBasic } from './lecture.serializer'

export const toJsonReview = (review: EReview.Extended, user?: session_userprofile): IReview.Basic => {
  // const representativeLecture = getRepresentativeLecture(review.course.lecture)

  let isLiked = true
  if (!user || !review.review_reviewvote) {
    isLiked = false
  }
  else if (!review.review_reviewvote.find((reviewvote) => reviewvote.userprofile_id === user.id)) {
    isLiked = false
  }

  // const courseResult = toJsonCourseBasic(review.course, representativeLecture)

  const result = {
    id: review.id,
    course: {
      id: review.course.id,
      old_old_code: review.course.old_code,
      old_code: review.course.new_code,
      department: toJsonDepartment(review.course.subject_department, true),
      type: review.course.type,
      type_en: review.course.type_en,
      title: review.course.title,
      title_en: review.course.title_en,
      summary: review.course.summury, // Todo: fix summury typo in db.
      review_total_weight: review.course.review_total_weight + 0.000001,
    },
    lecture: toJsonLectureBasic(review.lecture),
    content: review.is_deleted ? '관리자에 의해 삭제된 코멘트입니다.' : review.content,
    like: Math.round(review.like),
    is_deleted: Math.round(review.is_deleted),
    grade: Math.round(review.grade),
    load: Math.round(review.load),
    speech: Math.round(review.speech),
    userspecific_is_liked: isLiked,
  }
  return result
}

export const toJsonReviewVote = (reviewVote: EReview.EReviewVote.Basic): IReview.IReviewVote.Basic => ({
  id: reviewVote.id,
  review_id: reviewVote.review_id,
  userprofile_id: reviewVote.userprofile_id,
  created_datetime: reviewVote.created_datetime,
})
