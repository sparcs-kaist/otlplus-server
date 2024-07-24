import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import {
  OrderDefaultValidator,
  _PROHIBITED_FIELD_PATTERN,
} from '../decorators/validators.decorator';
import { ICourse } from './ICourse';
import { ILecture } from './ILecture';

export namespace IReview {
  export interface Basic {
    id: number;

    course: ICourse.FeedBasic;

    lecture: ILecture.DetailedResponse;

    content: string;

    like: number;

    is_deleted: number;

    grade: number;

    load: number;

    speech: number;

    userspecific_is_liked: boolean;
  }

  export class LectureReviewsQueryDto {
    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
    @IsArray()
    @IsString({ each: true })
    @OrderDefaultValidator(_PROHIBITED_FIELD_PATTERN)
    order?: string[];

    @IsOptional()
    @IsInt()
    @Min(0)
    @Type(() => Number)
    offset?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(100)
    @Type(() => Number)
    limit?: number;
  }
}

export namespace IReview {
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
}
