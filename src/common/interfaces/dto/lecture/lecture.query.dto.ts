import { IsArray, IsNumber, IsNumberString, IsOptional, IsString } from "class-validator";
import { Transform } from "class-transformer";
import { CourseQueryDto } from "../course/course.request.dto";

export class LectureQueryDTO extends CourseQueryDto{

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