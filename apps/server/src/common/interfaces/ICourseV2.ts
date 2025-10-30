import { IProfessorV2 } from '@otl/server-nest/common/interfaces/IProfessorV2'
import { Transform } from 'class-transformer'
import {
  IsArray, IsIn, IsNumber, IsOptional, IsString,
} from 'class-validator'

import { IDepartmentV2 } from './IDepartmentV2'

export type CourseOrderQuery = 'code' | 'popular' | 'studentCount'
type language = 'kr' | 'en'
export type level = 'ALL' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'
export type CourseType = 'ALL' | 'BR' | 'BE' | 'MR' | 'ME' | 'MGC' | 'HSE' | 'GR' | 'EG' | 'OE' | 'ETC'

export namespace ICourseV2 {
  export interface Basic {
    id: number
    name: string // kr : title / en : title_en
    code: string // new_code
    type: string // kr, en 구분
    department: IDepartmentV2.Basic
    professors: IProfessorV2.Basic[]
    summary: string
    open: boolean // 현재학기 개설 여부
    completed: boolean // 수강 여부 (authorized 안되어 있으면 false)
  }

  export interface Detail {
    id: number
    name: string
    code: string
    type: string
    department: IDepartmentV2.Basic
    // 개설 이력
    history: {
      year: number
      semester: number
      classes: {
        lectureId: number
        classNo: string // 분반
        professors: IProfessorV2.Basic[] // 해당 분반의 교수님
      }[]
      myProfessors: IProfessorV2.Basic[] // 본인이 수강한 학기의 경우, 수강한 분반의 교수님
      // 한 lecture에 여러명의 교수님이 존재할 수 있음
    }[]
    summary: string
    classDuration: number // 강의시간
    expDuration: number // 실험시간
    credit: number
    creditAU: number
  }

  export class Query {
    @IsOptional()
    @IsString()
    @IsIn(['kr', 'en'], { message: 'language must be \'kr\' or \'en\'' })
    language: language = 'kr' // 기본값 kr

    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
    @IsArray()
    @IsIn(['ALL', 'BR', 'BE', 'MR', 'ME', 'MGC', 'HSE', 'GR', 'EG', 'OE', 'ETC'], {
      each: true,
      message: 'type[] must be valid CourseType',
    })
    type?: CourseType[]

    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
    @IsArray()
    @IsString({ each: true })
    department?: number[] // 각 department의 id

    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
    @IsArray()
    @IsIn(['ALL', '100', '200', '300', '400', '500', '600', '700', '800', '900'], {
      each: true,
      message: 'level[] must be one of \'ALL\' or \'100\'..\'900\'',
    })
    level?: level[]

    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
    @IsArray()
    @IsString({ each: true })
    term?: number // 과목 기간 (최근 n년 이내 검색)

    @IsOptional()
    @IsString()
    keyword?: string // 검색어

    @IsOptional()
    @IsString()
    @IsIn(['code', 'popular', 'studentCount'], { message: 'order must be one of \'code\', \'popular\', \'studentCount\'' })
    order?: CourseOrderQuery

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => parseInt(value))
    offset?: number

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => parseInt(value))
    limit?: number
  }

  export class singleReadQuery {
    @IsOptional()
    @IsString()
    @IsIn(['kr', 'en'], { message: 'language must be \'kr\' or \'en\'' })
    language: language = 'kr' // 기본값 kr
  }
}
