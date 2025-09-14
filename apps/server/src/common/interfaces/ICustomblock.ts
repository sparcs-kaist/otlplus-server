import { Transform, Type } from 'class-transformer'
import {
  IsDate, IsInt, IsNotEmpty, IsOptional, IsString,
} from 'class-validator'

// HH:mm 문자열을 UTC 기준 Date(1970-01-01 HH:mm:00)로 변환
// HH:mm 형식을 바로 쓸 수 없어 앞에 기본 날짜 붙이기
function hhmmToUTCDateStrict(value: unknown): Date | unknown {
  if (value instanceof Date) return value
  if (typeof value !== 'string') return value
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value.trim())
  if (!m) return value
  const [, hh, mm] = m
  return new Date(Date.UTC(1970, 0, 1, Number(hh), Number(mm), 0))
}

export namespace ICustomblock {
  export interface Basic {
    id: number
    block_name: string
    place: string
    day: number
    begin: Date
    end: Date
  }

  // View model for responses where times should be strings (HH:mm)
  export interface BasicView {
    id: number
    block_name: string
    place: string
    day: number
    begin: string // e.g., "21:00"
    end: string // e.g., "21:30"
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
    @Transform(({ value }) => hhmmToUTCDateStrict(value))
    @IsDate()
    begin!: Date

    @IsNotEmpty()
    @Transform(({ value }) => hhmmToUTCDateStrict(value))
    @IsDate()
    end!: Date
  }

  export class CreateResponse {
    id!: number
  }

  // GET 목록 응답 래퍼
  export class ListResponse {
    custom_blocks!: ICustomblock.BasicView[]
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
