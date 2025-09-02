import { Type } from 'class-transformer'
import { IsArray, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, ValidateNested } from 'class-validator'

import { SemesterEnum, TimeBlock, TimeBlockDay } from '@otl/common/enum/time'

import { IsTimeBlock, IsTimeBlockDay } from '../decorators/time-block-validator.decorator'
import { ILecture } from './ILecture'
import { IPersonal } from './IPersonal'
import { ITimetable } from './ITimetable'

export namespace IMeeting {
  export interface Group {
    id: number
    year: number
    semester: SemesterEnum
    begin: number
    end: number
    days: TimeBlockDay[]

    start_week: number // 시작 주차
    end_week: number // 종료 주차
    title: string
    leader_user_profile_id: number // session_user_profile.id
    schedule: IMeeting.Schedule[]
    max_member: number
    members: IMeeting.Member[]

    result?: IMeeting.Result
  }

  export interface Member {
    id: number // IMeeting_group_participant.id
    user_id?: number // session_user_profile.id
    studentNumber: string // 학번
    name: string // `${firstName} ${lastName}`
    available_timeBlock: TimeBlock[]
  }

  export interface Schedule {
    timeBlock: TimeBlock // 무조건 duration이 1
    available_members: IMeeting.Member[]
    unavailable_members: IMeeting.Member[]
  }

  export interface Result {
    id: number // IMeeting_group_result_id
    group_id: number // IMeeting_group_id
    year: number
    semester: number

    start_week: number // 시작 주차
    end_week: number // 종료 주차

    title: string
    timeBlocks: (TimeBlock & {
      available_members: Omit<IMeeting.Member, 'available_timeBlock'>[]
      unavailable_members: Omit<IMeeting.Member, 'available_timeBlock'>[]
    })[]
    place: string | null // 장소
    description: string | null // 설명
    color: number // 색상 원래 어떻게 저장하지
  }

  export interface HiddenTimetable extends Omit<ITimetable.Summary, 'lectures' | 'personals' | 'meetings'> {
    lectures: Pick<ILecture.Summary, 'timeBlocks'>[]
    personals: Pick<IPersonal.Block, 'timeBlock'>[]
    meetings: Pick<IMeeting.Result, 'timeBlocks'>[]
  }

  export interface GroupSummary {
    title: string
    id: number // meeting_group.id
    isLeader: boolean
    // link: string
    currentMember: number
    max_members: number
    has_result: boolean // 결과가 있는 지 없는 지
  }

  export interface GroupStatus {
    id: number
    name: string
    begin: number // 8시부터 0
    maxMember: number
    currentMember: IMeeting.Member[]
    timetable?: ITimetable.Summary // 로그인 되어 있을 때만 반환,
    schedule: IMeeting.Schedule[]
    isLeader: boolean
  }

  export class GroupCreateDto {
    @IsString()
    @IsNotEmpty()
    title!: string

    @IsNumber()
    @IsNotEmpty()
    begin!: number

    @IsNumber()
    @IsNotEmpty()
    end!: number

    @IsNumber()
    @IsNotEmpty()
    maxMember!: number

    @IsNumber()
    @IsNotEmpty()
    year!: number

    @IsNumber()
    @IsNotEmpty()
    semester!: number

    @IsNumber()
    @IsNotEmpty()
    startWeek!: number

    @IsNumber()
    @IsNotEmpty()
    endWeek!: number

    @IsArray()
    @IsTimeBlockDay()
    days!: TimeBlockDay[]
  }

  export class GroupUpdateNameDto {
    @IsString()
    @IsNotEmpty()
    title!: string
  }

  export interface GroupNameUpdateResponse {
    id: number
    title: string
  }
  class UserDto {
    @IsString()
    @IsNotEmpty()
    studentNumber!: string

    @IsString()
    @IsNotEmpty()
    name!: string
  }
  export class GroupMemberCreateDto {
    @IsOptional()
    @ValidateNested()
    @Type(() => UserDto)
    user?: UserDto
  }

  export interface GroupMemberCreateResponse {
    member: {
      id: number
      groupId: number
      studentNumber: string
      name: string
      user_id: number | null
    }
  }

  export class GroupResultCreateDto {
    @IsArray()
    @IsTimeBlock()
    timeBlocks!: TimeBlock[]

    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    @IsInt()
    color!: number
  }

  export class GroupResultUpdateDto {
    @IsString()
    @IsNotEmpty()
    title!: string

    @IsString()
    @IsNotEmpty()
    place!: string

    @IsString()
    @IsNotEmpty()
    description!: string

    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    @IsInt()
    color!: number
  }

  export class GroupScheduleUpdateDto {
    @IsArray()
    @IsTimeBlock()
    timeBlocks!: TimeBlock[]

    @IsOptional()
    @IsString()
    studentNumber?: string
  }

  class InnerUserDto {
    @IsString()
    studentNumber!: string
  }

  export class UserStudentIdDto {
    @IsOptional()
    @ValidateNested()
    @Type(() => InnerUserDto)
    user?: InnerUserDto
  }
}
