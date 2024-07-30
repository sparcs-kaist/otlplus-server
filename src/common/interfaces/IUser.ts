import { Transform, Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import {
  OrderDefaultValidator,
  _PROHIBITED_FIELD_PATTERN,
} from 'src/common/decorators/validators.decorator';
import { IDepartment } from './IDepartment';
import { ILecture } from './ILecture';
import { IReview } from './IReview';

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
