import { ICourse } from '../../ICourse';
import { LectureResponseDto } from '../lecture/lecture.response.dto';

export interface ReviewResponseDto {
  id: number;

  course: ICourse.ForPlanner;

  lecture: LectureResponseDto;

  content: string;

  like: number;

  is_deleted: number;

  grade: number;

  load: number;

  speech: number;

  userspecific_is_liked: boolean;
}
