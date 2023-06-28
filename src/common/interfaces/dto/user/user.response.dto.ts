import {
  review_review, session_userprofile_favorite_departments,
  session_userprofile_taken_lectures, subject_department, subject_lecture } from "@prisma/client";

export interface ProfileDto {
  id: string;
  email: string;
  student_id: string;
  firstName: string;
  lastName: string;
  department: subject_department
  majors: subject_department[]
  departments: subject_department[]
  favorite_departments: session_userprofile_favorite_departments[]
  review_writeable_lectures: session_userprofile_taken_lectures[]
  my_timetable_lectures: session_userprofile_taken_lectures[]
  reviews: review_review[]
}
