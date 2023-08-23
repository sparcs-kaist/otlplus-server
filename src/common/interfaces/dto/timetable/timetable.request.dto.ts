import { Transform } from "class-transformer";
import { IsArray, IsNumber, IsOptional, IsString, Min, ValidateBy } from "class-validator";
import {
  _PROHIBITED_FIELD_PATTERN,
  InverseRegexValidator,
  RegexValidator
} from "../../../decorators/validators.decorator";

export const TIMETABLE_MAX_LIMIT = 50;

export class TimetableQueryDto {

  @IsNumber()
  @IsOptional()
  year?: number

  @IsNumber()
  @IsOptional()
  semester?: number

  @InverseRegexValidator(_PROHIBITED_FIELD_PATTERN)
  @IsOptional()
  @Transform(({value}) => typeof value === 'string' ? [value] : value)
  @IsArray()
  @IsString({each: true})
  order?: string[]

  @IsOptional()
  @Transform(({ value }) => value ?? 0)
  @IsNumber()
  offset?: number

  @IsOptional()
  @Transform(({ value }) => value ?? TIMETABLE_MAX_LIMIT)
  @IsNumber()
  limit?: number
}

export class TimetableCreateDto {
  @IsNumber()
  year: number;

  @IsNumber()
  semester: number;

  @IsArray()
  @IsNumber({},{each: true})
  lectures: number[]
}
