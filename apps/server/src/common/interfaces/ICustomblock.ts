import { Type } from 'class-transformer'
import {
  ArrayNotEmpty, IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, ValidateIf, ValidateNested,
} from 'class-validator'

export namespace ICustomblock {
  export class Time {
    @IsInt()
    @Min(0)
    @Max(6)
    day!: number

    @IsInt()
    @Min(0)
    @Max(1439)
    begin!: number

    @IsInt()
    @Min(1)
    @Max(1440)
    end!: number
  }

  export interface Basic {
    id: number
    block_name: string
    place: string
    day: number
    begin: number // 00시부터 경과 분 (예: 780 = 13:00)
    end: number // 00시부터 경과 분 (예: 810 = 13:30)
    times: Time[]
  }

  export class CreateDto {
    @IsNotEmpty()
    @IsString()
    @Type(() => String)
    block_name!: string

    @IsString()
    @Type(() => String)
    place!: string

    @ValidateIf((data) => data.times === undefined)
    @IsNotEmpty()
    @IsInt()
    @Min(0)
    @Max(6)
    day?: number

    @ValidateIf((data) => data.times === undefined)
    @IsNotEmpty()
    @IsInt()
    @Min(0) // 00:00 = 0분
    @Max(1439) // 23:59 = 1439분
    begin?: number

    @ValidateIf((data) => data.times === undefined)
    @IsNotEmpty()
    @IsInt()
    @Min(1)
    @Max(1440) // 24:00 = 1440분
    end?: number

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => Time)
    times?: Time[]
  }

  export class CreateResponse {
    id!: number
  }

  // GET 목록 응답 래퍼
  export class ListResponse {
    custom_blocks!: ICustomblock.Basic[]
  }

  export class UpdateDto {
    @IsOptional()
    @IsString()
    @Type(() => String)
    block_name?: string

    @IsOptional()
    @IsString()
    @Type(() => String)
    place?: string

    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(6)
    @Type(() => Number)
    day?: number

    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(1439)
    @Type(() => Number)
    begin?: number

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(1440)
    @Type(() => Number)
    end?: number

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => Time)
    times?: Time[]
  }

  export class DeleteDto {
    id!: number
  }
}
