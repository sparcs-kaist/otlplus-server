import { ESemester } from '@otl/api-interface/src/entities/ESemester';
export declare namespace ISemester {
  class QueryDto {
    order?: string[];
  }
  type Response = Omit<ESemester.Basic, 'id'>;
}
