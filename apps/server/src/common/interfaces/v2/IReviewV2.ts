import { ApiProperty } from '@nestjs/swagger'
import { StringStripLength } from '@otl/server-nest/common/interfaces/validators.decorator'
import { Type } from 'class-transformer'
import {
  IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, Validate,
} from 'class-validator'

import { IProfessorV2 } from './IProfessorV2'

export namespace IReviewV2 {
  export interface Basic {
    id: number
    courseId: number
    courseName: string
    professor: IProfessorV2.Basic
    year: number
    semester: number // 1-4
    content: string
    like: number
    grade: number // 0-5
    load: number // 0-5
    speech: number // 0-5
    isDeleted: boolean
    likedByUser: boolean // authorized 안 되어있으면 false
  }

  export interface GetResponseDto {
    reviews: Basic[]
    averageGrade: number
    averageLoad: number
    averageSpeech: number
    myReviewId: number[]
  }

  export class QueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    /* 'default' 모드에서만 사용 */
    courseId?: number

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    /* 'default' 모드에서만 사용 */
    professorId?: number

    @IsString()
    @IsIn(['default', 'recent', 'hall-of-fame', 'popular-feed'])
    mode!: 'default' | 'recent' | 'hall-of-fame' | 'popular-feed'

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    /* 'hall-of-fame' 모드에서만 사용 */
    year?: number

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    /* 'hall-of-fame' 모드에서만 사용 */
    semester?: number

    @Type(() => Number)
    @IsNumber()
    offset!: number

    @Type(() => Number)
    @IsNumber()
    limit!: number
  }

  export class CreateDto {
    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    courseId!: number

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    professorId!: number

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    year!: number

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    @Max(4)
    @Type(() => Number)
    semester!: number

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @Validate(StringStripLength)
    content!: string

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    @Max(5)
    @Type(() => Number)
    grade!: number

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    @Max(5)
    @Type(() => Number)
    load!: number

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    @Max(5)
    @Type(() => Number)
    speech!: number
  }

  export class CreateResponseDto {
    @ApiProperty({ type: Number })
    id!: number
  }
}
