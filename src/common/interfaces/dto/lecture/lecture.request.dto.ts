import { Transform } from 'class-transformer';
import { IsArray, IsNumber, IsOptional } from 'class-validator';
import { ICourse } from '../../ICourse';

export class LectureQueryDto extends ICourse.Query {
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
