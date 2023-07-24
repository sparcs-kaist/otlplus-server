import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Validate,
} from 'class-validator';
import { OrderDefaultValidator } from './validators';

export class getReviewDto {
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
