import { IDepartment } from '../../IDepartment';
import { ILecture } from '../../ILecture';
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
  review_writable_lectures: ILecture.Detail[];
  my_timetable_lectures: ILecture.Detail[];
  reviews: ReviewResponseDto[];
}
