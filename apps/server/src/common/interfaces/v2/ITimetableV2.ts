// TODO: waiting for lecture
// import { ILecture } from '@otl/server-nest/common/interfaces/v2/ILecture'
import { Type } from 'class-transformer'
import {
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength, // , IsArray
} from 'class-validator'

export const TIMETABLE_MAX_LIMIT = 50

export namespace ITimetableV2 {
  export class QueryDto {
    @IsString()
    @Type(() => String)
    user_id?: string
  }

  export class DeleteReqDto {
    @IsNumber()
    @Type(() => Number)
    id!: number
  }

  export class DeleteResDto {
    @IsString()
    @Type(() => String)
    message!: string
  }

  export class UpdateReqDto {
    @IsNumber()
    @Type(() => Number)
    id!: number

    @IsString()
    @IsOptional()
    @MinLength(1)
    @MaxLength(255)
    @Type(() => String)
    name?: string

    @IsNumber()
    @IsOptional()
    @Min(0)
    @Type(() => Number)
    order?: number
  }

  export class UpdateResDto {
    @IsString()
    @Type(() => String)
    message!: string
  }

  export class TimetableResDto {
    @IsNumber()
    @Type(() => Number)
    id!: number

    @IsString()
    @Type(() => String)
    name!: string

    @IsNumber()
    @Type(() => Number)
    userId!: number

    @IsNumber()
    @Type(() => Number)
    year!: number

    @IsNumber()
    @Type(() => Number)
    semester!: number

    @IsNumber()
    @Type(() => Number)
    timeTableOrder!: number
    // todo: waiting for lecture
    // @IsArray()
    // lectures!: ILecture.Detail[]
  }

  export interface Response {
    id: number
    year: number | null
    semester: number | null
    timeTableOrder: number
    userId: number
  }
}
