import { IReview } from '@otl/api-interface/src/interfaces/IReview';
import { IDepartment } from '@otl/api-interface/src/interfaces/IDepartment';
import { ILecture } from '@otl/api-interface/src/interfaces/ILecture';
import { ICourse } from '@otl/api-interface/src/interfaces/ICourse';
export declare namespace IFeed {
  interface Basic {
    type: string;
    date: Date;
    priority: number;
  }
  interface FamousHumanityReview extends Basic {
    reviews: IReview.Basic[];
  }
  interface FamousMajorReview extends Basic {
    reviews: IReview.Basic[];
    department: IDepartment.Basic;
  }
  interface ReviewWrite extends Basic {
    lecture: ILecture.Basic;
  }
  interface RelatedCourse extends Basic {
    course: ICourse.FeedRelated;
  }
  interface RankedReview extends Basic {
    reviews: IReview.Basic[];
  }
  type Details = Basic | FamousHumanityReview | FamousMajorReview | ReviewWrite | RelatedCourse | RankedReview;
  class QueryDto {
    date: string;
  }
}
