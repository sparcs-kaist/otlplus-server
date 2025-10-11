import { ApiProperty } from '@nestjs/swagger'
import { IReview } from '@otl/server-nest/common/interfaces/IReview'
import { StringStripLength } from '@otl/server-nest/common/interfaces/validators.decorator'
import {
  IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, Validate,
} from 'class-validator'

export namespace IReviewV2 {
  export interface GetResponseDto {
    reviews: IReview.Basic[]
    averageGrade: number
    averageLoad: number
    averageSpeech: number
    myReviewId: number[]
  }

  export class QueryDto {
    @IsOptional()
    @IsNumber()
    /* 'default' 모드에서만 사용 */
    courseId?: number

    @IsOptional()
    @IsNumber()
    /* 'default' 모드에서만 사용 */
    professorId?: number

    @IsNotEmpty()
    @IsString()
    @IsIn(['default', 'recent', 'hall-of-fame', 'popular-feed'])
    mode!: 'default' | 'recent' | 'hall-of-fame' | 'popular-feed'

    @IsOptional()
    @IsNumber()
    /* 'hall-of-fame' 모드에서만 사용 */
    year?: number

    @IsOptional()
    @IsNumber()
    /* 'hall-of-fame' 모드에서만 사용 */
    semester?: number

    @IsNotEmpty()
    @IsNumber()
    offset!: number

    @IsNotEmpty()
    @IsNumber()
    limit!: number
  }

  export class CreateDto {
    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    courseId!: number

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    professorId!: number

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    year!: number

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    @Max(4)
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
    grade!: number

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    @Max(5)
    load!: number

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    @Max(5)
    speech!: number
  }

  export class CreateResponseDto {
    @ApiProperty()
    id!: number
  }

  export class PatchLikedDto {
    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    reviewId!: number

    @ApiProperty({ enum: ['like', 'unlike'] })
    @IsString()
    @IsNotEmpty()
    @IsIn(['like', 'unlike'])
    action!: 'like' | 'unlike'
  }
}
