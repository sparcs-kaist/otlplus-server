import { ICourse } from '@otl/api-interface/src/interfaces/ICourse';
import { ILecture } from '@otl/api-interface/src/interfaces/ILecture';
export declare namespace IReview {
  export interface Basic {
    id: number;
    course: ICourse.Basic;
    lecture: ILecture.Basic;
    content: string;
    like: number;
    is_deleted: number;
    grade: number;
    load: number;
    speech: number;
    userspecific_is_liked: boolean;
  }
  export interface FeedBasic {
    id: number;
    course: ICourse.FeedBasic;
    lecture: ILecture.Detail;
    content: string;
    like: number;
    is_deleted: number;
    grade: number;
    load: number;
    speech: number;
    userspecific_is_liked: boolean;
  }
  export interface reCalcScoreReturn {
    reviewNum: number;
    totalWeight: number;
    sums: {
      gradeSum: number;
      loadSum: number;
      speechSum: number;
    };
    avgs: {
      grade: number;
      load: number;
      speech: number;
    };
  }
  export namespace IReviewVote {
    interface Basic {
      id: number;
      review_id: number;
      userprofile_id: number | null;
      created_datetime: Date | null;
    }
  }
  export class LectureReviewsQueryDto {
    order?: string[];
    offset?: number;
    limit?: number;
  }
  export class QueryDto {
    lecture_year?: number;
    lecture_semester?: number;
    response_type?: string;
    order?: string[];
    offset?: number;
    limit?: number;
  }
  export class CreateDto {
    content: string;
    lecture: number;
    grade: number;
    load: number;
    speech: number;
  }
  const UpdateDto_base: import('@nestjs/common').Type<Partial<Omit<CreateDto, 'lecture'>>>;
  export class UpdateDto extends UpdateDto_base {}
  export {};
}
