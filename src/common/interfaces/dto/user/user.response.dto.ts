import {
  review_review, session_userprofile_favorite_departments,
  session_userprofile_taken_lectures, subject_department, subject_lecture } from "@prisma/client";
import { DepartmentResponseDto } from "../department/department.response.dto";
import { ReviewResponseDto } from "../reviews/review.response.dto";

export interface ProfileDto {
  id: number;
  email: string;
  student_id: string;
  firstName: string;
  lastName: string;
  department: DepartmentResponseDto
  majors: DepartmentResponseDto[]
  departments: DepartmentResponseDto[]
  favorite_departments: DepartmentResponseDto[]
  review_writeable_lectures: session_userprofile_taken_lectures[]
  my_timetable_lectures: session_userprofile_taken_lectures[]
  reviews: ReviewResponseDto[]
}
