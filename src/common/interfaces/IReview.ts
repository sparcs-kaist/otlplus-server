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
import { LectureResponseDto } from './dto/lecture/lecture.response.dto';

export namespace IReview {
  export interface Basic {
    id: number;

    course: ICourse.Basic;

    lecture: LectureResponseDto;

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
