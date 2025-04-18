import { IsArray, IsOptional } from 'class-validator'

import { ESemester } from '@otl/prisma-client/entities'

import { OrderDefaultValidator, PROHIBITED_FIELD_PATTERN } from './validators.decorator'

export namespace ISemester {
  export class QueryDto {
    @IsOptional()
    @IsArray()
    @OrderDefaultValidator(PROHIBITED_FIELD_PATTERN)
    order?: string[]
  }

  export type Response = Omit<ESemester.Basic, 'id'>
}
