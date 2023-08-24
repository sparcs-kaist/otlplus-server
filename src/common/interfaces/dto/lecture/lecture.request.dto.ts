import { OrderDefaultValidator, _PROHIBITED_FIELD_PATTERN } from 'src/common/decorators/request-ordervalidator.decorator';
import { IsArray, IsNumber, IsNumberString, IsOptional, IsString } from "class-validator";
import { Transform, Type } from "class-transformer";
import { CourseQueryDto } from "../course/course.request.dto";

export class LectureQueryDto extends CourseQueryDto{

  @IsOptional()
  @Transform(({value}) => typeof value === 'string' ? [value] : value)
  @Transform(({value}) => value.map((v)=> parseInt(v)))
  @IsArray()
  @IsNumber({},{each: true})
  year?: number[];

  @IsOptional()
  @Transform(({value}) => typeof value === 'string' ? [value] : value)
  @Transform(({value}) => value.map((v)=> parseInt(v)))
  @IsArray()
  @IsNumber({},{each: true})
  semester?: number[];

  @IsOptional()
  @Transform(({value}) => typeof value === 'string' ? [value] : value)
  @Transform(({value}) => value.map((v)=> parseInt(v)))
  @IsArray()
  @IsNumber({},{each: true})
  day?: number[];

  @IsOptional()
  @Transform(({value}) => typeof value === 'string' ? [value] : value)
  @Transform(({value}) => value.map((v)=> parseInt(v)))
  @IsArray()
  @IsNumber({},{each: true})
  begin?: number[];

  @IsOptional()
  @Transform(({value}) => typeof value === 'string' ? [value] : value)
  @Transform(({value}) => value.map((v)=> parseInt(v)))
  @IsArray()
  @IsNumber({},{each: true})
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
  @IsNumber()
  @Type(() => Number)
  offset?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;
}