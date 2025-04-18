import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, Validate } from 'class-validator';
import { ICourse } from '@otl/server-nest/common/interfaces/ICourse';
import { ILecture } from '@otl/server-nest/common/interfaces/ILecture';
import {
  _PROHIBITED_FIELD_PATTERN,
  OrderDefaultValidator,
  StringStripLength,
} from '@otl/server-nest/common/interfaces/validators.decorator';

export namespace IReview {
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

  export namespace IReviewVote {
    export interface Basic {
      id: number;
      review_id: number;
      userprofile_id: number | null;
      created_datetime: Date | null;
    }
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

  export class QueryDto {
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    lecture_year?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    lecture_semester?: number;

    @IsOptional()
    @IsString()
    response_type?: string;

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

  export class CreateDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @Validate(StringStripLength)
    content!: string;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    lecture!: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    @Max(5)
    @Type(() => Number)
    grade!: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    @Max(5)
    @Type(() => Number)
    load!: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    @Max(5)
    @Type(() => Number)
    speech!: number;
  }

  export class UpdateDto extends PartialType(OmitType(IReview.CreateDto, ['lecture'])) {}
}
