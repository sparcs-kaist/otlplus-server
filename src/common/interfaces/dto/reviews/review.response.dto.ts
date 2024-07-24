import { ICourse } from '../../ICourse';
import { ILecture } from '../../ILecture';

export interface ReviewResponseDto {
  id: number;

  course: ICourse.Basic;

  lecture: ILecture.Basic;

  content: string;

  like: number;

  is_deleted: number;

  grade: number;

  load: number;

  speech: number;

  userspecific_is_liked: boolean;
}
