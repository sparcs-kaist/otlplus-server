import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  Validate,
} from 'class-validator';
import { CourseResponseDto } from '../course/course.response.dto';
import { OrderDefaultValidator, StringStripLength } from './validators';
import { OmitType, PartialType } from "@nestjs/swagger";

export class ReviewQueryDto {
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
  @IsArray()
  @Validate(OrderDefaultValidator)
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

export class ReviewCreateDto {
  @IsString()
  @IsNotEmpty()
  @Validate(StringStripLength)
  content: string;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  lecture: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  grade: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  load: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  speech: number;
}

// export class patchReviewDto extends PartialType(OmitType(PostReviewDto, ['lecture'])){
//
// }

// nestjs-swagger
export class ReviewUpdateDto {
  @IsOptional()
  @IsString()
  @Validate(StringStripLength)
  content?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  grade?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  load?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  speech?: number;
}