import { session_userprofile } from '@prisma/client';
import { EReview } from '@otl/api-interface/src/entities/EReview';
import { getRepresentativeLecture } from '@src/common/utils/lecture.utils';
import { IReview } from '@otl/api-interface/src/interfaces/IReview';
import { toJsonCourseBasic } from './course.serializer';
import { toJsonLectureBasic } from './lecture.serializer';

export const toJsonReview = (review: EReview.Details, user?: session_userprofile): IReview.Basic => {
  const representativeLecture = getRepresentativeLecture(review.course.lecture);

  let isLiked = true;
  if (!user || !review.review_reviewvote) {
    isLiked = false;
  } else if (!review.review_reviewvote.find((reviewvote) => reviewvote.userprofile_id === user.id)) {
    isLiked = false;
  }

  const courseResult = toJsonCourseBasic(review.course, representativeLecture);

  const result = {
    id: review.id,
    course: courseResult,
    lecture: toJsonLectureBasic(review.lecture),
    content: review.is_deleted ? '관리자에 의해 삭제된 코멘트입니다.' : review.content,
    like: Math.round(review.like),
    is_deleted: Math.round(review.is_deleted),
    grade: Math.round(review.grade),
    load: Math.round(review.load),
    speech: Math.round(review.speech),
    userspecific_is_liked: isLiked,
  };
  return result;
};

export const toJsonReviewVote = (reviewVote: EReview.EReviewVote.Basic): IReview.IReviewVote.Basic => {
  return {
    id: reviewVote.id,
    review_id: reviewVote.review_id,
    userprofile_id: reviewVote.userprofile_id,
    created_datetime: reviewVote.created_datetime,
  };
};
