import { IsArray, IsOptional } from 'class-validator';
import {
  OrderDefaultValidator,
  _PROHIBITED_FIELD_PATTERN,
} from '../decorators/validators.decorator';
import { ESemester } from '../entities/ESemester';

export namespace ISemester {
  export class QueryDto {
    @IsOptional()
    @IsArray()
    @OrderDefaultValidator(_PROHIBITED_FIELD_PATTERN)
    order?: string[];
  }

  export type Response = Omit<ESemester.Basic, 'id'>;
}
