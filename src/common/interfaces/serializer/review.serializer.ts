import { session_userprofile } from '@prisma/client';
import { EReview } from 'src/common/entities/EReview';
import { getRepresentativeLecture } from 'src/common/utils/lecture.utils';
import { ReviewResponseDto } from './../dto/reviews/review.response.dto';
import { toJsonCourse } from './course.serializer';
import { toJsonLecture } from './lecture.serializer';

export const toJsonReview = (
  review: EReview.Details,
  user?: session_userprofile,
): ReviewResponseDto => {
  const representativeLecture = getRepresentativeLecture(review.course.lecture);
  const professorRaw = review.course.subject_course_professors.map(
    (x) => x.professor,
  );
  let isLiked = true;
  if (!user || !review.review_reviewvote) {
    isLiked = false;
  } else if (
    !review.review_reviewvote.find(
      (reviewvote) => reviewvote.userprofile_id === user.id,
    )
  ) {
    isLiked = false;
  }

  const courseResult = toJsonCourse<true>(
    review.course,
    representativeLecture,
    professorRaw,
    true,
  );

  const result = {
    id: review.id,
    course: courseResult,
    lecture: toJsonLecture<true>(review.lecture, true),
    content: review.is_deleted
      ? '관리자에 의해 삭제된 코멘트입니다.'
      : review.content,
    like: review.like,
    is_deleted: review.is_deleted,
    grade: review.grade,
    load: review.load,
    speech: review.speech,
    userspecific_is_liked: isLiked,
  };
  return result;
};
