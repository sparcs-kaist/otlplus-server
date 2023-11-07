import { IsArray, IsOptional } from 'class-validator';
import {
  OrderDefaultValidator,
  _PROHIBITED_FIELD_PATTERN,
} from '../../../decorators/validators.decorator';

export class SemesterQueryDto {
  @IsOptional()
  @IsArray()
  @OrderDefaultValidator(_PROHIBITED_FIELD_PATTERN)
  order?: string[];
}
