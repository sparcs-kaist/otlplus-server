import { Transform, Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { _PROHIBITED_FIELD_PATTERN, OrderDefaultValidator } from '@otl/api-interface/src/interfaces/validators.decorator';
import { IDepartment } from '@otl/api-interface/src/interfaces/IDepartment';
import { ILecture } from '@otl/api-interface/src/interfaces/ILecture';
import { IReview } from '@otl/api-interface/src/interfaces/IReview';


export namespace IUser {
  export class TakenCoursesQueryDto {
    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
    @IsArray()
    @IsString({ each: true })
    @OrderDefaultValidator(_PROHIBITED_FIELD_PATTERN)
    order?: string[];
  }

  export class ReviewLikedQueryDto {
    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
    @IsArray()
    @IsString({ each: true })
    @OrderDefaultValidator(_PROHIBITED_FIELD_PATTERN)
    order?: string[];

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    offset?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    limit?: number;
  }

  export interface Basic {
    id: number
    user_id: number | null
    student_id: string
    sid: string
    language: string | null
    portal_check: number | null
    department_id: number | null
    email: string | null
    date_joined: Date
    first_name: string
    last_name: string
    refresh_token: string | null
  }

  export interface Profile {
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
    reviews: IReview.Basic[];
  }
}
