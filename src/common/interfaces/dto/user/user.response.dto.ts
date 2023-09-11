import { session_userprofile_taken_lectures } from '@prisma/client';
import { DepartmentResponseDto } from '../department/department.response.dto';
import { ReviewResponseDto } from '../reviews/review.response.dto';

export interface ProfileDto {
  id: number;
  email: string;
  student_id: string;
  firstName: string;
  lastName: string;
  department: DepartmentResponseDto;
  majors: DepartmentResponseDto[];
  departments: DepartmentResponseDto[];
  favorite_departments: DepartmentResponseDto[];
  review_writable_lectures: session_userprofile_taken_lectures[];
  my_timetable_lectures: session_userprofile_taken_lectures[];
  reviews: ReviewResponseDto[];
}
