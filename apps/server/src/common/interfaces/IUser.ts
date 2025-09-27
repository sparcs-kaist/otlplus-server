import { IDepartment } from '@otl/server-nest/common/interfaces/IDepartment'
import { ILecture } from '@otl/server-nest/common/interfaces/ILecture'
import { IReview } from '@otl/server-nest/common/interfaces/IReview'
import {
  OrderDefaultValidator,
  PROHIBITED_FIELD_PATTERN,
} from '@otl/server-nest/common/interfaces/validators.decorator'
import { Transform, Type } from 'class-transformer'
import {
  IsArray, IsNotEmpty, IsNumber, IsOptional, IsString,
} from 'class-validator'

export namespace IUser {
  export interface sso_info_OneApp {
    sso_info: string
  }
  export class TakenCoursesQueryDto {
    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
    @IsArray()
    @IsString({ each: true })
    @OrderDefaultValidator(PROHIBITED_FIELD_PATTERN)
    order?: string[]
  }

  export class ReviewLikedQueryDto {
    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
    @IsArray()
    @IsString({ each: true })
    @OrderDefaultValidator(PROHIBITED_FIELD_PATTERN)
    order?: string[]

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    offset?: number

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    limit?: number
  }

  export interface Basic {
    id: number
    user_id: number | null
    student_id: string
    sid: string
    language: string | null
    portal_check: number | null
    department_id: number | null
    email: string | null
    date_joined: Date
    first_name: string
    last_name: string
    refresh_token: string | null
  }

  export interface Profile {
    id: number
    email: string
    student_id: string
    firstName: string
    lastName: string
    department: IDepartment.Basic | null
    majors: IDepartment.Basic[]
    departments: IDepartment.Basic[]
    favorite_departments: IDepartment.Basic[]
    review_writable_lectures: ILecture.Detail[]
    my_timetable_lectures: ILecture.Detail[]
    reviews: IReview.Basic[]
  }

  export interface SimpleProfile {
    id: number
    email: string
    student_id: string
    firstName: string
    lastName: string
    department: IDepartment.Basic | null
    majors: IDepartment.Basic[]
    departments: IDepartment.Basic[]
    favorite_departments: IDepartment.Basic[]
  }

  export class TokenDto {
    @IsNotEmpty()
    token!: string
  }

  export interface TokenResponse {
    accessToken: string
    refreshToken: string
  }
}
