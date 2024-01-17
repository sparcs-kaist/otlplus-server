import { Transform, Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import {
  OrderDefaultValidator,
  _PROHIBITED_FIELD_PATTERN,
} from '../../../decorators/validators.decorator';
export class PlannerRequestDtoDefault {
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
