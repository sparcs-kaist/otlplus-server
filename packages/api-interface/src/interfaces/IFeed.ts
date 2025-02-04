import { IsDateString } from 'class-validator';
import { IReview } from '@otl/api-interface/src/interfaces/IReview';
import { IDepartment } from '@otl/api-interface/src/interfaces/IDepartment';
import { ILecture } from '@otl/api-interface/src/interfaces/ILecture';
import { ICourse } from '@otl/api-interface/src/interfaces/ICourse';

export namespace IFeed {
  export interface Basic {
    type: string;
    date: Date;
    priority: number;
  }

  export interface FamousHumanityReview extends Basic {
    reviews: IReview.Basic[];
  }

  export interface FamousMajorReview extends Basic {
    reviews: IReview.Basic[];
    department: IDepartment.Basic;
  }

  export interface ReviewWrite extends Basic {
    lecture: ILecture.Basic;
  }

  export interface RelatedCourse extends Basic {
    course: ICourse.FeedRelated;
  }

  export interface RankedReview extends Basic {
    reviews: IReview.Basic[];
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
