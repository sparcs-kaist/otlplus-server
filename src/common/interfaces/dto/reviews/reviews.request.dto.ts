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

export class GetReviewDto {
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

export class PostReviewDto {
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