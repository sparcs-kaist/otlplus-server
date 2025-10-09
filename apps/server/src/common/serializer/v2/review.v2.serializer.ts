import { IReviewV2 } from '@otl/server-nest/common/interfaces/v2/IReviewV2'
import { session_userprofile } from '@prisma/client'

import { EReview } from '@otl/prisma-client/entities'

export const toJsonReviewV2 = (
  review: EReview.Extended,
  user?: session_userprofile,
  language: string = 'kr',
): IReviewV2.Basic => {
  let isLiked = false
  if (user && review.review_reviewvote) {
    isLiked = !!review.review_reviewvote.find((reviewvote) => reviewvote.userprofile_id === user.id)
  }

  // 첫 번째 교수 정보 추출 (기존 로직과 호환성 유지)
  const professors = review.lecture.subject_lecture_professors.map((x) => x.professor)
  const firstProfessor = professors[0]

  const professorV2 = firstProfessor
    ? {
      professor_id: firstProfessor.professor_id,
      name_en: firstProfessor.professor_name_en ?? '',
      name:
          language.includes('en') && firstProfessor.professor_name_en
            ? firstProfessor.professor_name_en
            : firstProfessor.professor_name,
      review_total_weight: firstProfessor.review_total_weight + 0.000001,
    }
    : {
      professor_id: 0,
      name: 'Unknown',
      name_en: '',
      review_total_weight: 0,
    }

  return {
    id: review.id,
    courseId: review.course.id,
    courseName: language.includes('en') && review.course.title_en ? review.course.title_en : review.course.title,
    professor: professorV2,
    year: review.lecture.year,
    semester: review.lecture.semester,
    content: review.is_deleted ? '관리자에 의해 삭제된 코멘트입니다.' : review.content,
    like: Math.round(review.like),
    grade: Math.round(review.grade),
    load: Math.round(review.load),
    speech: Math.round(review.speech),
    isDeleted: !!review.is_deleted,
    userspecific_is_liked: isLiked,
  }
}
