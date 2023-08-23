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
import { StringStripLength } from '../../../decorators/reviews.request.validators';
import { ApiProperty, OmitType, PartialType } from "@nestjs/swagger";
import { _PROHIBITED_FIELD_PATTERN, OrderDefaultValidator } from 'src/common/decorators/request-ordervalidator.decorator';
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

export class ReviewCreateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Validate(StringStripLength)
  content: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  lecture: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  grade: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  load: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  speech: number;
}

export class ReviewUpdateDto extends PartialType(
  OmitType(ReviewCreateDto, ['lecture']),
) {}