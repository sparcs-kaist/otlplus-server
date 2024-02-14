import { IsDateString } from 'class-validator';
import { ICourse } from './ICourse';
import { DepartmentResponseDto } from './dto/department/department.response.dto';
import { NestedLectureResponseDto } from './dto/lecture/lecture.response.dto';
import { ReviewResponseDto } from './dto/reviews/review.response.dto';

export namespace IFeed {
  export interface Basic {
    type: string;
    date: Date;
    priority: number;
  }

  export interface FamousHumanityReview extends Basic {
    reviews: ReviewResponseDto[];
  }

  export interface FamousMajorReview extends Basic {
    reviews: ReviewResponseDto[];
    department: DepartmentResponseDto;
  }

  export interface ReviewWrite extends Basic {
    lecture: NestedLectureResponseDto;
  }

  export interface RelatedCourse extends Basic {
    course: ICourse.Related;
  }

  export interface RankedReview extends Basic {
    reviews: ReviewResponseDto[];
  }

  export type Details =
    | Basic
    | FamousHumanityReview
    | FamousMajorReview
    | ReviewWrite
    | RelatedCourse
    | RankedReview;

  export class QueryDto {
    @IsDateString()
    date!: string;
  }
}
