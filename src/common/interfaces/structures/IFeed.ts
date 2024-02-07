import { IsDateString } from 'class-validator';
import { ICourse } from '../dto/course/ICourse';
import { DepartmentResponseDto } from '../dto/department/department.response.dto';
import { NestedLectureResponseDto } from '../dto/lecture/lecture.response.dto';
import { ReviewResponseDto } from '../dto/reviews/review.response.dto';

export namespace IFeed {
  export interface IBasic {
    type: string;
    date: Date;
    priority: number;
  }

  export interface IFamousHumanityReview extends IBasic {
    reviews: ReviewResponseDto[];
  }

  export interface IFamousMajorReview extends IBasic {
    reviews: ReviewResponseDto[];
    department: DepartmentResponseDto;
  }

  export interface IReviewWrite extends IBasic {
    lecture: NestedLectureResponseDto;
  }

  export interface IRelatedCourse extends IBasic {
    course: ICourse.IBasic;
  }

  export interface IRankedReview extends IBasic {
    reviews: ReviewResponseDto[];
  }

  export type IDetials =
    | IBasic
    | IFamousHumanityReview
    | IFamousMajorReview
    | IReviewWrite
    | IRelatedCourse
    | IRankedReview;

  export interface IDetailss {}

  export class QueryDto {
    @IsDateString()
    date!: string;
  }
}
