import { IDepartment } from '@otl/api-interface/src/interfaces/IDepartment';
import { ILecture } from '@otl/api-interface/src/interfaces/ILecture';
import { IReview } from '@otl/api-interface/src/interfaces/IReview';
export declare namespace IUser {
  class TakenCoursesQueryDto {
    order?: string[];
  }
  class ReviewLikedQueryDto {
    order?: string[];
    offset?: number;
    limit?: number;
  }
  interface Basic {
    id: number;
    user_id: number | null;
    student_id: string;
    sid: string;
    language: string | null;
    portal_check: number | null;
    department_id: number | null;
    email: string | null;
    date_joined: Date;
    first_name: string;
    last_name: string;
    name_kor: string;
    name_eng: string;
    refresh_token: string | null;
  }
  interface Profile {
    id: number;
    email: string;
    student_id: string;
    firstName: string;
    lastName: string;
    nameKor: string;
    nameEng: string;
    department: IDepartment.Basic | null;
    majors: IDepartment.Basic[];
    departments: IDepartment.Basic[];
    favorite_departments: IDepartment.Basic[];
    review_writable_lectures: ILecture.Detail[];
    my_timetable_lectures: ILecture.Detail[];
    reviews: IReview.Basic[];
  }
}
