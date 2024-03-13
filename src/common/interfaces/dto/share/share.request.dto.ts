import { IsInt, IsOptional, IsString } from 'class-validator';

export class TimetableImageQueryDto {
  @IsInt()
  timetable!: number;

  @IsInt()
  year!: number;

  @IsInt()
  semester!: number;

  @IsString()
  @IsOptional()
  language?: string;
}
