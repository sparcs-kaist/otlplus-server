import { IDepartment } from '@otl/server-nest/common/interfaces/IDepartment'
import { ILecture } from '@otl/server-nest/common/interfaces/ILecture'
import { IReview } from '@otl/server-nest/common/interfaces/IReview'
import {
  OrderDefaultValidator,
  PROHIBITED_FIELD_PATTERN,
} from '@otl/server-nest/common/interfaces/validators.decorator'
import { Transform, Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator'

import { IDepartmentV2 } from './IDepartmentV2'
import { ILectureV2 } from './ILectureV2'
import { IReviewV2 } from './IReviewV2'

export namespace IUserV2 {
  export interface SsoInfoOneApp {
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

  export interface Info {
    id: number
    name: string
    mail: string
    studentNumber: number
    degree: string | null
    majorDepartments: IDepartmentV2.Basic[]
    interestedDepartments: IDepartmentV2.Basic[]
  }

  export class TokenDto {
    @IsNotEmpty()
    token!: string
  }

  export interface TokenResponse {
    accessToken: string
    refreshToken: string
  }

  export interface SimpleProfile {
    id: number
    email: string
    student_id: string
    firstName: string
    lastName: string
    department: IDepartmentV2.Basic | null
    majors: IDepartmentV2.Basic[]
    departments: IDepartmentV2.Basic[]
    favorite_departments: IDepartmentV2.Basic[]
  }

  export class ProfessorItem {
    @IsNumber()
    @Min(0)
    id!: number

    @IsString()
    name!: string
  }

  export class LectureItem {
    @IsString()
    name!: string

    @IsString()
    code!: string

    @IsNumber()
    @Min(0)
    courseId!: number

    @IsNumber()
    @Min(0)
    lectureId!: number

    @IsArray()
    @ValidateNested({ each: true })
    professors!: ProfessorItem[]

    @IsBoolean()
    written!: boolean
  }

  export class LecturesWrap {
    @IsNumber()
    @Min(0)
    year!: number

    @IsNumber()
    @Min(1)
    semester!: number

    @IsArray()
    @ValidateNested({ each: true })
    lectures!: LectureItem[]
  }

  export class LecturesResponse {
    @IsNumber()
    @Min(0)
    totalLecturesCount!: number

    @IsNumber()
    @Min(0)
    reviewedLecturesCount!: number

    @IsNumber()
    @Min(0)
    totalLikesCount!: number

    @IsArray()
    @ValidateNested({ each: true })
    lecturesWrap!: LecturesWrap[]
  }

  export interface WishlistCourseItem {
    id: number
    name: string
    code: string
    type: string
    completed: boolean
    lectures: ILectureV2.Basic[]
  }

  export interface WrittenReviewsResponse {
    reviews: IReviewV2.Basic[]
  }

  export interface WishlistResponse {
    courses: WishlistCourseItem[]
  }

  export class UpdateWishlistDto {
    @IsNumber()
    @Min(0)
    lectureId!: number

    @IsIn(['add', 'delete'], { message: 'mode must be either "add" or "delete"' })
    mode!: 'add' | 'delete'
  }

  export class WishlistQueryDto {
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    year!: number

    @IsNumber()
    @Min(1)
    @Max(4)
    @Type(() => Number)
    semester!: number
  }
}
