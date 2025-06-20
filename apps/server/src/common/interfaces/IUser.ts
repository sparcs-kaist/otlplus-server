import { IDepartment } from '@otl/server-nest/common/interfaces/IDepartment'
import { ILecture } from '@otl/server-nest/common/interfaces/ILecture'
import { IReview } from '@otl/server-nest/common/interfaces/IReview'
import {
  OrderDefaultValidator,
  PROHIBITED_FIELD_PATTERN,
} from '@otl/server-nest/common/interfaces/validators.decorator'
import { Transform, Type } from 'class-transformer'
import {
  ArrayNotEmpty, IsArray, IsEnum, IsInt, IsNumber, IsOptional, IsString,
} from 'class-validator'

export namespace IUser {
  export class TakenCoursesQueryDto {
    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
    @IsArray()
    @IsString({ each: true })
    @OrderDefaultValidator(PROHIBITED_FIELD_PATTERN)
    order?: string[]
  }

  export class v2AddOrRemoveWishlistDto {
    @IsNumber()
    @Type(() => Number)
    lectureId!: number

    @IsEnum(['delete', 'add'])
    @IsString()
    mode?: 'delete' | 'add'
  }

  export class v2ModifyInterestedMajorDepartmentIdsDto {
    @IsArray()
    @ArrayNotEmpty()
    @Type(() => Number)
    @IsInt({ each: true })
    interestedMajorDepartmentIds!: number[]
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

  export interface v2TakenLectures {
    totalLectures: number
    reviewdLectures: number
    totalLikes: number
    info: v2TakenLecturesinfo[]
  }

  export interface v2TakenLecturesinfo {
    year: number
    semester: number
    lectures: v2TakenLecturesDetail[]
  }

  export interface v2TakenLecturesDetail {
    lectureId: number
    code: string
    lectureName: string
    isReviewed: boolean
    courseId: number
    professorId: number
  }

  export interface v2LikedReviews {
    courseId: number
    reviewId: number
    lectureName: string
    professorName: string
    year: number
    semester: number
    content: string
    like: number
    isDeleted: boolean
    grade: number
    load: number
    speech: number
    userspecificIsLiked: boolean | null
  }

  export interface v2UserInfo {
    name: string
    mail: string | null
    studentNumber: number
    courses: string[]
    majorDepartment: string | undefined
    interestedMajorDepartments: string[]
  }
}
