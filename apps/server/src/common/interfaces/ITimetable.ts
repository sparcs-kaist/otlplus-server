import { ILecture } from '@otl/server-nest/common/interfaces/ILecture'
import {
  OrderDefaultValidator,
  PROHIBITED_FIELD_PATTERN,
} from '@otl/server-nest/common/interfaces/validators.decorator'
import { Transform, Type } from 'class-transformer'
import {
  IsArray, IsNumber, IsOptional, IsString,
} from 'class-validator'

export const TIMETABLE_MAX_LIMIT = 50

export namespace ITimetable {
  export interface IClasstime {
    id: number
    day: number
    begin: Date
    end: Date
    type: string
    building_id: string | null
    building_full_name: string | null
    building_full_name_en: string | null
    room_name: string | null
    unit_time: number | null
    lecture_id: number | null
  }

  export interface Response {
    id: number
    lectures: ILecture.Detail[] | null | undefined
    arrange_order: number
  }

  export interface v2Response {
    timetableId: number
    year: number | null
    semester: number | null
    timetableOrder: number
    userId: number
  }

  export interface v2DetailedResponse {
    timetableId: number
    timetableName: string | null
    userId: number
    year: number | null
    semester: number | null
    timetableOrder: number
    lectures: ILecture.v2Detail[] | null | undefined
  }

  export class QueryDto {
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    year?: number

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    semester?: number

    @OrderDefaultValidator(PROHIBITED_FIELD_PATTERN)
    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
    @IsArray()
    @IsString({ each: true })
    order?: string[]

    @IsOptional()
    @Transform(({ value }) => value ?? 0)
    @IsNumber()
    offset?: number

    @IsOptional()
    @Type(() => Number)
    @Transform(({ value }) => value ?? TIMETABLE_MAX_LIMIT)
    @IsNumber()
    limit?: number
  }

  export class CreateDto {
    @IsNumber()
    year!: number

    @IsNumber()
    semester!: number

    @IsArray()
    @IsNumber({}, { each: true })
    lectures!: number[]
  }

  export class v2CreateDto {
    @IsNumber()
    userId!: number

    @IsNumber()
    year!: number

    @IsNumber()
    semester!: number

    @IsArray()
    @IsNumber({}, { each: true })
    lectures!: number[]
  }

  export class v2DeleteDto {
    @IsNumber()
    @Type(() => Number)
    timeTableId!: number
  }

  export class v2UpdateDto {
    @IsNumber()
    @Type(() => Number)
    timeTableId!: number

    @IsOptional()
    @IsString()
    @Transform(({ value }) => (typeof value === 'string' ? value : null))
    timeTableName?: string | null

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    timeTableOrder?: number | null
  }

  export class v2ModifyLectureDto {
    @IsNumber()
    @Type(() => Number)
    lectureId!: number

    @IsString()
    @Transform(({ value }) => (typeof value === 'string' ? value : null))
    mode!: string
  }

  export class AddLectureDto {
    @IsNumber()
    @Type(() => Number)
    lecture!: number
  }

  export class ReorderTimetableDto {
    @IsNumber()
    @Type(() => Number)
    arrange_order!: number
  }
}
