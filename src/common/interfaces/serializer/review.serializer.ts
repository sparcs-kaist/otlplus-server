import { toJsonCourse } from './course.serializer';
import { review_review } from 'src/prisma/generated/prisma-class/review_review';
import { ReviewResponseDto } from './../dto/reviews/review.response.dto';
import { getRepresentativeLecture } from 'src/common/utils/lecture.utils';
import { subject_professor } from 'src/prisma/generated/prisma-class/subject_professor';
export const toJsonReview= (review: review_review): ReviewResponseDto=>{
    const representativeLecture = getRepresentativeLecture(review.course.lecture);
    const professorRaw = review.course.subject_course_professors.map(
      (x) => x.professor as subject_professor,
    );
    const courseResult = toJsonCourse(
      review.course,
      representativeLecture,
      professorRaw,
      true,
    );
    Object.assign(courseResult, {
      userspecific_is_read: false,
    });
    
    const result = {
      id: review.id,
      course: courseResult,
      lecture: "toJsonLecture(review.lecture, true)",
      content: review.is_deleted
        ? '관리자에 의해 삭제된 코멘트입니다.'
        : review.content,
      like: review.like,
      is_deleted: review.is_deleted,
      grade: review.grade,
      load: review.load,
      speech: review.speech,
    };
    return result;
}