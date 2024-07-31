import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class TimetableImageQueryDto {
  @Type(() => Number)
  @IsNumber()
  timetable!: number;

  @Type(() => Number)
  @IsNumber()
  year!: number;

  @Type(() => Number)
  @IsNumber()
  semester!: number;

  @IsString()
  @IsOptional()
  language?: string;
}

export class TimetableIcalQueryDto {
  @Type(() => Number)
  @IsNumber()
  timetable!: number;

  @Type(() => Number)
  @IsNumber()
  year!: number;

  @Type(() => Number)
  @IsNumber()
  semester!: number;

  @IsString()
  @IsOptional()
  language?: string;
}
