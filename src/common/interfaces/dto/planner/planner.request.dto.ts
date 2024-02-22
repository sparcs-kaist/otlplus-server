import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  OrderDefaultValidator,
  _PROHIBITED_FIELD_PATTERN,
} from '../../../decorators/validators.decorator';
export class PlannerQueryDto {
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

export class PlannerBodyDto {
  @IsInt()
  start_year!: number;
  @IsInt()
  end_year!: number;
  @IsInt()
  general_track!: number;
  @IsInt()
  major_track!: number;
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  additional_tracks?: number[];
  @IsOptional()
  @IsBoolean()
  should_update_taken_semesters?: boolean;
  @IsArray()
  @IsInt({ each: true })
  taken_items_to_copy!: number[];
  @IsArray()
  @IsInt({ each: true })
  future_items_to_copy!: number[];
  @IsArray()
  @IsInt({ each: true })
  arbitrary_items_to_copy!: number[];
}
