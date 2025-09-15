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
  IsArray, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, Validate,
} from 'class-validator'

export namespace IReview {
  export interface Basic {
    id: number

    course: {
      id: number
    }

    lecture: ILecture.Basic

    content: string

    like: number

    is_deleted: number

    grade: number

    load: number

    speech: number

    userspecific_is_liked: boolean
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
