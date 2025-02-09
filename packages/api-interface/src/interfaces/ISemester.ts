import { IsArray, IsOptional } from 'class-validator';
import { _PROHIBITED_FIELD_PATTERN, OrderDefaultValidator } from '@otl/api-interface/src/interfaces/validators.decorator';
import { ESemester } from '@otl/api-interface/src/entities/ESemester';


export namespace ISemester {
  export class QueryDto {
    @IsOptional()
    @IsArray()
    @OrderDefaultValidator(_PROHIBITED_FIELD_PATTERN)
    order?: string[];
  }

  export type Response = Omit<ESemester.Basic, 'id'>;
}
