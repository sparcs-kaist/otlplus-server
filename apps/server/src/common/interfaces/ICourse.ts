import { IDepartment } from '@otl/server-nest/common/interfaces/IDepartment'
import { IProfessor } from '@otl/server-nest/common/interfaces/IProfessor'
import { Transform } from 'class-transformer'
import {
  IsArray, IsNumber, IsOptional, IsString, Max, Min,
} from 'class-validator'

export namespace ICourse {
  export interface Basic {
    id: number
    old_code: string
    old_old_code: string
    department: IDepartment.Basic
    type: string
    type_en: string
    title: string
    title_en: string
    summary: string
    review_total_weight: number
    credit: number
    credit_au: number
    num_classes: number
    num_labs: number
  }

  export interface Detail extends Basic {
    related_courses_prior: Basic[]
    related_courses_posterior: Basic[]
    professors: IProfessor.Basic[]
    grade: number
    load: number
    speech: number
  }

  export interface DetailWithIsRead extends Detail {
    userspecific_is_read: boolean
  }

  export namespace ICourseUser {
    // eslint-disable-next-line no-shadow
    export interface Basic {
      id: number
      latest_read_datetime: Date
      course_id: number
      user_profile_id: number
    }
  }

  export interface FeedBasic {
    id: number
    old_code: string
    department_id: number
    type: string
    type_en: string
    title: string
    title_en: string
    summary: string
    grade_sum: number
    load_sum: number
    speech_sum: number
    review_total_weight: number
    grade: number
    load: number
    speech: number
    title_en_no_space: string
    title_no_space: string
  }

  export interface FeedRelated extends FeedBasic {
    related_courses_prior: FeedBasic[]
    related_courses_posterior: FeedBasic[]
  }

  export class AutocompleteQueryDto {
    @IsString()
    keyword!: string
  }

  export class Query {
    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
    @IsArray()
    @IsString({ each: true })
    department?: string[]

    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
    @IsArray()
    @IsString({ each: true })
    type?: string[]

    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
    @IsArray()
    // @todo: @Transform()
    @IsString({ each: true })
    level?: string[]

    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
    @IsArray()
    @IsString({ each: true })
    group?: string[]

    @IsOptional()
    @IsString()
    keyword?: string

    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
    @IsArray()
    @IsString({ each: true })
    term?: string[]

    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
    @IsArray()
    @IsString({ each: true })
    order?: string[]

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => parseInt(value))
    offset?: number

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => parseInt(value))
    limit?: number
  }

  export class LectureQueryDto {
    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
    @IsArray()
    @IsString({ each: true })
    order?: string[]
  }

  export class ReviewQueryDto {
    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
    @IsArray()
    @IsString({ each: true })
    order?: string[]

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => parseInt(value))
    @Min(0, { message: 'Offset must be a non-negative number' })
    offset?: number

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => parseInt(value))
    @Min(0, { message: 'limit must be a non-negative number' })
    @Max(100, { message: 'limit must be less than or equal to 100' })
    limit?: number
  }
}
