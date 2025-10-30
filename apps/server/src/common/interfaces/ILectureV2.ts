import { CourseOrderQuery, CourseType, level } from '@otl/server-nest/common/interfaces/ICourseV2'
import { IDepartmentV2 } from '@otl/server-nest/common/interfaces/IDepartmentV2'
import { IProfessorV2 } from '@otl/server-nest/common/interfaces/IProfessorV2'
import { Transform } from 'class-transformer'
import {
  IsArray, IsDefined, IsIn, IsInt, IsNumber, IsOptional, IsString, Max, Min,
} from 'class-validator'

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
    averageGrade: Float32Array
    averageLoad: Float32Array
    averageSpeech: Float32Array
    isEnglish: boolean // 영어 강의 여부
    professors: IProfessorV2.Basic[]
    classes: ILectureV2.Classtime[]
    examTime: ILectureV2.ExamTime | null
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
