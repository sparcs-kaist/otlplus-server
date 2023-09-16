import { Transform, Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import {
  OrderDefaultValidator,
  _PROHIBITED_FIELD_PATTERN,
} from '../../../decorators/validators.decorator';

export const TIMETABLE_MAX_LIMIT = 50;

export class TimetableQueryDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  year?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  semester?: number;

  @OrderDefaultValidator(_PROHIBITED_FIELD_PATTERN)
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  @IsArray()
  @IsString({ each: true })
  order?: string[];

  @IsOptional()
  @Transform(({ value }) => value ?? 0)
  @IsNumber()
  offset?: number;

  @IsOptional()
  @Transform(({ value }) => value ?? TIMETABLE_MAX_LIMIT)
  @IsNumber()
  limit?: number;
}

export class TimetableCreateDto {
  @IsNumber()
  year!: number;

  @IsNumber()
  semester!: number;

  @IsArray()
  @IsNumber({}, { each: true })
  lectures!: number[];
}

export class AddLectureDto {
  @IsNumber()
  @Type(() => Number)
  lecture!: number;
}
