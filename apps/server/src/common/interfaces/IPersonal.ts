import {
  IsArray, IsEnum, IsNumber, IsOptional, IsString,
} from 'class-validator'

import { TimeTableColorEnum } from '@otl/common/enum/color'
import { SemesterEnum, TimeBlock } from '@otl/common/enum/time'

import { IsTimeBlock } from '../decorators/time-block-validator.decorator'

export namespace IPersonal {
  export interface Block {
    id: number
    year: number
    semester: number
    user_id: number // (userProfileId)
    timetable_id: number | null // timetable.id 로, null이면 기본시간표
    title: string
    timeBlock: TimeBlock[]
    place: string | null // 장소
    description: string | null // 설명
    color: TimeTableColorEnum
  }

  export class CreateDto {
    @IsNumber()
    @IsOptional()
    timetableId?: number // timetable.id, nullable(학사)

    @IsNumber()
    year!: number

    @IsNumber()
    @IsEnum(SemesterEnum)
    semester!: SemesterEnum

    @IsArray()
    @IsTimeBlock()
    timeBlocks!: TimeBlock[]

    @IsString()
    title!: string

    @IsString()
    @IsOptional()
    place?: string

    @IsString()
    @IsOptional()
    description?: string

    @IsEnum(TimeTableColorEnum)
    color!: TimeTableColorEnum
  }

  export class UpdateDto {
    @IsString()
    title!: string

    @IsString()
    @IsOptional()
    place?: string

    @IsString()
    description!: string

    @IsEnum(TimeTableColorEnum)
    color!: TimeTableColorEnum

    @IsArray()
    @IsTimeBlock()
    timeBlocks!: TimeBlock[]
  }
}
