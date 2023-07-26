import { Transform } from "class-transformer";
import { IsNumber, IsOptional, IsString, Min, ValidateBy } from "class-validator";
import {
  _PROHIBITED_FIELD_PATTERN,
  InverseRegexValidator,
  RegexValidator
} from "../../../decorators/validators.decorator";

export const TIMETABLE_MAX_LIMIT = 50;

export class TimeTableQueryDto {

  @IsNumber()
  @IsOptional()
  year?: number

  @IsNumber()
  @IsOptional()
  semester?: number

  @InverseRegexValidator(_PROHIBITED_FIELD_PATTERN)
  @IsString()
  @IsOptional()
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
