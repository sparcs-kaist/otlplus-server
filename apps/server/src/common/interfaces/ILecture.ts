import { ICourse } from '@otl/server-nest/common/interfaces/ICourse'
import { IDepartment } from '@otl/server-nest/common/interfaces/IDepartment'
import { IProfessor } from '@otl/server-nest/common/interfaces/IProfessor'
import { ITimetable } from '@otl/server-nest/common/interfaces/ITimetable'
import { Transform, Type } from 'class-transformer'
import {
  IsInt, IsNumber, IsOptional, IsString,
} from 'class-validator'

export namespace ILecture {
  export interface Classtime {
    building_code: string
    room_name: string
    classroom: string
    classroom_en: string
    classroom_short: string
    classroom_short_en: string
    day: number
    begin: number
    end: number
  }

  export interface v2Classtime {
    day: number
    begin: number
    end: number
    buildingCode: string
    placeName: string
    placeNameShort: string | null
  }

  export interface ExamTime {
    day: number
    str: string
    str_en: string
    begin: number
    end: number
  }

  export interface v2ExamTime {
    day: number
    str: string
    begin: number
    end: number
  }

  export interface Raw {
    id: number
    code: string
    old_code: string
    year: number
    semester: number
    department_id: number
    class_no: string
    title: string
    title_en: string
    type: string
    type_en: string
    audience: number
    credit: number
    title_en_no_space: string
    title_no_space: string
    num_classes: number
    num_labs: number
    credit_au: number
    limit: number
    num_people: number | null // Allow num_people to be null
    is_english: boolean
    deleted: boolean
    course_id: number
    grade_sum: number
    load_sum: number
    speech_sum: number
    grade: number
    load: number
    speech: number
    review_total_weight: number
    class_title: string | null
    class_title_en: string | null
    common_title: string | null
    common_title_en: string | null
    subject_classtime: ITimetable.IClasstime[]
    // professor_names: string[] | null; // 교수 이름 목록
    // professor_names_en: string[] | null; // 교수 영문 이름 목록
    // classroom_str: string | null; // 강의실 문자열
    // classroom_str_en: string | null; // 강의실 영문 문자열
    // classroom_short: string | null; // 강의실 축약 문자열
    // classroom_short_en: string | null; // 강의실 영문 축약 문자열
    // Additional properties as needed
  }

  export interface Basic {
    id: number
    title: string
    title_en: string
    course: number
    old_old_code: string
    old_code: string
    class_no: string
    year: number
    semester: number
    code: string
    department: number
    department_code: string
    department_name: string
    department_name_en: string
    type: string
    type_en: string
    limit: number
    num_people: number | null
    is_english: boolean
    num_classes: number
    num_labs: number
    credit: number
    credit_au: number
    common_title: string
    common_title_en: string
    class_title: string
    class_title_en: string
    review_total_weight: number
    professors: IProfessor.Basic[]
  }

  export interface Detail extends Basic {
    grade: number
    load: number
    speech: number
    classtimes: Classtime[]
    examtimes: ExamTime[]
  }

  export interface v2Detail {
    lectureId: number
    courseId: number
    classNo: string
    lectureName: string
    code: string
    departmentId: number
    type: string
    limitPeople: number
    numPeople: number | null
    lectureDuration: number
    credit: number
    au: number
    scoreGrade: number
    scoreLoad: number
    scoreSpeech: number
    isEnglish: boolean
    professors: IProfessor.v2Basic[]
    classes: v2Classtime[]
    examTimes: v2ExamTime[]
  }

  export interface UserTaken extends Omit<Basic, 'department'> {
    classTime: Classtime
    department: IDepartment.Basic
  }

  export class QueryDto extends ICourse.Query {
    @IsOptional()
    // @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    year?: number

    @IsOptional()
    // @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    semester?: number

    @IsOptional()
    // @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    day?: number

    @IsOptional()
    // @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    begin?: number

    @IsOptional()
    // @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    end?: number
  }

  export class AutocompleteQueryDto {
    @IsInt()
    @Type(() => Number)
    year!: number

    @IsInt()
    @Type(() => Number)
    semester!: number

    @IsString()
    keyword!: string
  }
}
