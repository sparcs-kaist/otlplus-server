import { IsDateString } from 'class-validator';
import { ICourse } from './ICourse';
import { IDepartment } from './IDepartment';
import { ILecture } from './ILecture';
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
    department: IDepartment.Basic;
  }

  export interface ReviewWrite extends Basic {
    lecture: ILecture.Response;
  }

  export interface RelatedCourse extends Basic {
    course: ICourse.FeedRelated;
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
