import { IsArray, IsOptional } from 'class-validator';
import { ESemester } from '@otl/prisma-client/entities';
import { _PROHIBITED_FIELD_PATTERN, OrderDefaultValidator } from './validators.decorator';

export namespace ISemester {
  export class QueryDto {
    @IsOptional()
    @IsArray()
    @OrderDefaultValidator(_PROHIBITED_FIELD_PATTERN)
    order?: string[];
  }

  export type Response = Omit<ESemester.Basic, 'id'>;
}
