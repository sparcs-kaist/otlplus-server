import { Type } from 'class-transformer'
import {
  IsDate, IsInt, IsNotEmpty, IsOptional, IsString,
} from 'class-validator'

export namespace ICustomblock {
  export interface Basic {
    id: number
    block_name: string
    place: string
    day: number
    begin: Date
    end: Date
  }

  export class CreateDto {
    @IsNotEmpty()
    @IsString()
    @Type(() => String)
    block_name!: string

    @IsNotEmpty()
    @IsString()
    @Type(() => String)
    place!: string

    @IsNotEmpty()
    @IsInt()
    day!: number

    @IsNotEmpty()
    @Type(() => Date)
    @IsDate()
    begin!: Date

    @IsNotEmpty()
    @Type(() => Date)
    @IsDate()
    end!: Date
  }

  export class CreateResponse {
    id!: number
  }

  // GET 목록 응답 래퍼
  export class ListResponse {
    custom_blocks!: ICustomblock.Basic[]
  }

  export class UpdateDto {
    // PATCH: place, block_name만 수정 가능 (둘 다 optional)
    @IsOptional()
    @IsString()
    @Type(() => String)
    block_name?: string

    @IsOptional()
    @IsString()
    @Type(() => String)
    place?: string
  }

  export class DeleteDto {
    id!: number
  }
}
