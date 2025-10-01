// TODO: waiting for lecture
// import { ILecture } from '@otl/server-nest/common/interfaces/v2/ILecture'
import { Type } from 'class-transformer'
import {
  IsNumber, IsOptional, IsString, MaxLength, Min, MinLength,
} from 'class-validator'

export namespace ITimetableV2 {
  export class QueryDto {
    @IsString()
    @Type(() => String)
    user_id?: string
  }

  export class UpdateReqDto {
    @IsNumber()
    @Type(() => Number)
    timetableId!: number

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

  export interface Response {
    id: number
    year: number | null
    semester: number | null
    timeTableOrder: number
    userId: number
  }
}
