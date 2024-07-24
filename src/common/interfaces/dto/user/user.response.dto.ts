import { IDepartment } from '../../IDepartment';
import { LectureResponseDto } from '../lecture/lecture.response.dto';
import { ReviewResponseDto } from '../reviews/review.response.dto';

export interface ProfileDto {
  id: number;
  email: string;
  student_id: string;
  firstName: string;
  lastName: string;
  department: IDepartment.Basic | null;
  majors: IDepartment.Basic[];
  departments: IDepartment.Basic[];
  favorite_departments: IDepartment.Basic[];
  review_writable_lectures: LectureResponseDto[];
  my_timetable_lectures: LectureResponseDto[];
  reviews: ReviewResponseDto[];
}
