import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import {
  OrderDefaultValidator,
  _PROHIBITED_FIELD_PATTERN,
} from 'src/common/decorators/validators.decorator';
import { CourseQueryDto } from '../course/course.request.dto';

export class LectureQueryDto extends CourseQueryDto {
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  @Transform(({ value }) => value.map(parseInt))
  @IsArray()
  @IsNumber({}, { each: true })
  year?: number[];

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  @Transform(({ value }) => value.map(parseInt))
  @IsArray()
  @IsNumber({}, { each: true })
  semester?: number[];

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  @Transform(({ value }) => value.map(parseInt))
  @IsArray()
  @IsNumber({}, { each: true })
  day?: number[];

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  @Transform(({ value }) => value.map(parseInt))
  @IsArray()
  @IsNumber({}, { each: true })
  begin?: number[];

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  @Transform(({ value }) => value.map(parseInt))
  @IsArray()
  @IsNumber({}, { each: true })
  end?: number[];
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
