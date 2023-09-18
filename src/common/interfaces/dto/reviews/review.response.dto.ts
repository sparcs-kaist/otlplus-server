import { CourseResponseDto } from '../course/course.response.dto';
import { LectureResponseDto } from '../lecture/lecture.response.dto';

export class ReviewResponseDto {
  id!: number;

  course!: CourseResponseDto;

  lecture!: LectureResponseDto;

  content!: string;

  like!: number;

  is_deleted!: number;

  grade!: number;

  load!: number;

  speech!: number;

  userspecific_is_liked!: boolean;
}
