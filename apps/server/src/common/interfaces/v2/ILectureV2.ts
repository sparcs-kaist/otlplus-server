import { ApiPropertyOptional } from '@nestjs/swagger'
import { CourseOrderQuery, CourseType, level } from '@otl/server-nest/common/interfaces/v2/ICourseV2'
import { Transform } from 'class-transformer'
import {
  IsArray, IsDefined, IsIn, IsInt, IsNumber, IsOptional, IsString, Max, Min,
} from 'class-validator'

import { IDepartmentV2, IProfessorV2 } from '.'

export namespace ILectureV2 {
  export interface Classtime {
    day: number // 월요일 0, 화요일 1, ... , 금요일 4
    begin: number // 시작 시각(60*시 + 분)
    end: number // 끝나는 시각(60*시 + 분)
    buildingCode: string
    buildingName: string // localized
    roomName: string // localize 하지 않음 (en data 없음)
  }

  export interface ExamTime {
    day: number
    str: string // localized
    begin: number
    end: number
  }

  export interface Basic {
    id: number
    courseId: number
    classNo: string // 분반 정보
    name: string // localized
    code: string // 강의 코드
    department: IDepartmentV2.Basic
    type: string // localized
    limitPeople: number
    numPeople: number
    credit: number
    creditAU: number
    averageGrade: number // float
    averageLoad: number // float
    averageSpeech: number // float
    isEnglish: boolean // 영어 강의 여부
    professors: IProfessorV2.Basic[]
    classes: ILectureV2.Classtime[]
    examTimes: ILectureV2.ExamTime[]
  }

  export interface courseWrapped {
    courses: {
      id: number
      name: string
      code: string
      type: string
      lectures: ILectureV2.Basic[]
      completed: boolean
    }[]
  }

  export class getQuery {
    @IsOptional()
    @IsString()
    keyword?: string // 검색어

    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
    @IsArray()
    @IsIn(['ALL', 'BR', 'BE', 'MR', 'ME', 'MGC', 'HSE', 'GR', 'EG', 'OE', 'ETC'], {
      each: true,
      message: 'type[] must be valid CourseType',
    })
    type?: CourseType[]

    @IsOptional()
    @Transform(({ value }) => {
      if (Array.isArray(value)) return value.map(Number)
      if (typeof value === 'string') {
        try {
          // JSON 문자열 형태일 때
          if (value.startsWith('[') && value.endsWith(']')) {
            return JSON.parse(value).map(Number)
          }
          // 콤마 구분일 때
          return value.split(',').map(Number)
        }
        catch {
          return [Number(value)]
        }
      }
      return value
    })
    @IsArray()
    @IsInt({ each: true })
    @ApiPropertyOptional({ type: [Number], description: 'Department IDs' })
    department?: number[] // 각 department의 id

    @IsOptional()
    @Transform(({ value }) => {
      if (Array.isArray(value)) return value.map(Number)
      if (typeof value === 'string') {
        try {
          // JSON 문자열 형태일 때
          if (value.startsWith('[') && value.endsWith(']')) {
            return JSON.parse(value).map(Number)
          }
          // 콤마 구분일 때
          return value.split(',').map(Number)
        }
        catch {
          return [Number(value)]
        }
      }
      return value
    })
    @IsArray()
    @IsInt({ each: true })
    @IsIn([100, 200, 300, 400, 500, 600, 700, 800, 900], {
      each: true,
      message: 'level[] must be one of 100..900',
    })
    level?: level[]

    // year : 필수
    @IsDefined()
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    @Min(2000)
    @Max(2100)
    year!: number

    // semester : 필수
    @IsDefined()
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    @Min(1)
    @Max(4)
    semester!: number

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => parseInt(value))
    day?: number // 요일 (0-4)

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => parseInt(value))
    begin?: number // 시작 시각(60*시 + 분)

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => parseInt(value))
    end?: number // 끝나는 시각(60*시 + 분)

    @IsOptional()
    @IsString()
    @IsIn(['code', 'popular', 'studentCount'], { message: 'order must be one of \'code\', \'popular\', \'studentCount\'' })
    order?: CourseOrderQuery

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => parseInt(value))
    limit?: number

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => parseInt(value))
    offset?: number
  }
}
