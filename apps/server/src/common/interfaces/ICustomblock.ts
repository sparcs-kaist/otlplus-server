import { Type } from 'class-transformer'
import {
  IsInt, IsNotEmpty, IsOptional, IsString, Max, Min,
} from 'class-validator'

export namespace ICustomblock {
  export interface Basic {
    id: number
    block_name: string
    place: string
    day: number
    begin: number // 00시부터 경과 분 (예: 780 = 13:00)
    end: number // 00시부터 경과 분 (예: 810 = 13:30)
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
    @IsInt()
    @Min(0) // 00:00 = 0분
    @Max(1439) // 23:59 = 1439분
    begin!: number

    @IsNotEmpty()
    @IsInt()
    @Min(0) // 00:00 = 0분
    @Max(1439) // 23:59 = 1439분
    end!: number
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
