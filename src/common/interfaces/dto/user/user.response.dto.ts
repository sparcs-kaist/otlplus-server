import { DepartmentResponseDto } from '../department/department.response.dto';
import { LectureResponseDto } from '../lecture/lecture.response.dto';
import { ReviewResponseDto } from '../reviews/review.response.dto';

export interface ProfileDto {
  id: number;
  email: string;
  student_id: string;
  firstName: string;
  lastName: string;
  department: DepartmentResponseDto | null;
  majors: DepartmentResponseDto[];
  departments: DepartmentResponseDto[];
  favorite_departments: DepartmentResponseDto[];
  review_writable_lectures: LectureResponseDto[];
  my_timetable_lectures: LectureResponseDto[];
  reviews: ReviewResponseDto[];
}
