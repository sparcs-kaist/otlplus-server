import { ApiProperty } from '@nestjs/swagger'
import { ICourse } from '@otl/server-nest/common/interfaces/ICourse'
import { ILecture } from '@otl/server-nest/common/interfaces/ILecture'
import {
  OrderDefaultValidator,
  PROHIBITED_FIELD_PATTERN,
  StringStripLength,
} from '@otl/server-nest/common/interfaces/validators.decorator'
import { Transform, Type } from 'class-transformer'
import {
  IsArray, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, Validate,
} from 'class-validator'

import { ReviewSearchMode } from '@otl/common/enum/review'

export namespace IReview {
  export interface Basic {
    id: number

    course: ICourse.Basic

    lecture: ILecture.Basic

    content: string

    like: number

    is_deleted: number

    grade: number

    load: number

    speech: number

    userspecific_is_liked: boolean
  }

  export interface v2Basic {
    reviewId: number
    professorName: string
    year: number
    semester: number
    content: string
    like: number
    isDeleted: boolean
    grade: number
    load: number
    speech: number
    userspecificIsLiked: boolean | null
  }

  export interface v2Response {
    reviews: v2Basic[]
    myReviewId: number | null
  }

  export interface WithLiked extends Basic {
    userspecific_is_liked: boolean
  }

  export interface FeedBasic {
    id: number

    course: ICourse.FeedBasic

    lecture: ILecture.Detail

    content: string

    like: number

    is_deleted: number

    grade: number

    load: number

    speech: number

    userspecific_is_liked: boolean
  }

  export namespace IReviewVote {
    // eslint-disable-next-line no-shadow
    export interface Basic {
      id: number
      review_id: number
      userprofile_id: number | null
      created_datetime: Date | null
    }
  }

  export class LectureReviewsQueryDto {
    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
    @IsArray()
    @IsString({ each: true })
    @OrderDefaultValidator(PROHIBITED_FIELD_PATTERN)
    order?: string[]

    @IsOptional()
    @IsInt()
    @Min(0)
    @Type(() => Number)
    offset?: number

    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(100)
    @Type(() => Number)
    limit?: number
  }

  export class QueryDto {
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    lecture_year?: number

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    lecture_semester?: number

    @IsOptional()
    @IsString()
    response_type?: string

    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
    @IsArray()
    @IsString({ each: true })
    @OrderDefaultValidator(PROHIBITED_FIELD_PATTERN)
    order?: string[]

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    offset?: number

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    limit?: number
  }

  export class v2QueryDto {
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    courseId?: number

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    professorId?: number

    @IsEnum(ReviewSearchMode)
    @IsString()
    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
    mode?: ReviewSearchMode

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    year?: number

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    semester?: number
  }

  export class CreateDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @Validate(StringStripLength)
    content!: string

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    lecture!: number

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    @Max(5)
    @Type(() => Number)
    grade!: number

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    @Max(5)
    @Type(() => Number)
    load!: number

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    @Max(5)
    @Type(() => Number)
    speech!: number
  }
  export class UpdateDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @Validate(StringStripLength)
    content!: string

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    @Max(5)
    @Type(() => Number)
    grade!: number

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    @Max(5)
    @Type(() => Number)
    load!: number

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    @Max(5)
    @Type(() => Number)
    speech!: number
  }
}
