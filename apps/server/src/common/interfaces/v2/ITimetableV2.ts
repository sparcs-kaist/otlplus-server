import { Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator'

export const TIMETABLE_MAX_LIMIT = 50

export namespace ITimetableV2 {
  export class GetTimetablesReqDto {
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

  export interface GetTimetablesResDto {
    timetables: TimetableItem[]
  }

  export class DeleteReqDto {
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    id!: number
  }

  export class DeleteResDto {
    @IsString()
    @Type(() => String)
    message!: string
  }

  export class UpdateReqDto {
    @IsNumber()
    @Type(() => Number)
    id!: number

    @IsString()
    @IsOptional()
    @MinLength(1)
    @MaxLength(255)
    @Type(() => String)
    name?: string

    @IsNumber()
    @IsOptional()
    @Min(0)
    @Type(() => Number)
    order?: number
  }

  export class UpdateResDto {
    @IsString()
    @Type(() => String)
    message!: string
  }

  export class DepartmentResDto {
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    id!: number

    @IsString()
    @Type(() => String)
    name!: string
  }

  export class ProfessorResDto {
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    id!: number

    @IsString()
    @Type(() => String)
    name!: string
  }

  export class ClassResDto {
    @IsNumber()
    @Min(0)
    @Max(4)
    @Type(() => Number)
    day!: number

    @IsNumber()
    @Min(0)
    @Max(3000)
    begin!: number

    @IsNumber()
    @Min(0)
    @Max(3000)
    end!: number

    @IsString()
    @Type(() => String)
    buildingCode!: string

    @IsString()
    @Type(() => String)
    buildingName!: string

    @IsString()
    @Type(() => String)
    roomName!: string
  }

  export class ExamTimeResDto {
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    day!: number

    @IsString()
    @Type(() => String)
    str!: string

    @IsNumber()
    @Type(() => Number)
    begin!: number

    @IsNumber()
    @Type(() => Number)
    end!: number
  }

  export class LectureResDto {
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    id!: number

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    courseId!: number

    @IsString()
    @Type(() => String)
    classNo!: string

    @IsString()
    @Type(() => String)
    name!: string

    @IsString()
    @Type(() => String)
    subtitle!: string

    // this is temporary, waiting for department serializer
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DepartmentResDto)
    department!: DepartmentResDto

    @IsString()
    @Type(() => String)
    type!: string

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    limitPeople!: number

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    numPeople!: number

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    credit!: number

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    creditAU!: number

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    averageGrade!: number

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    averageLoad!: number

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    averageSpeech!: number

    @IsBoolean()
    @Type(() => Boolean)
    isEnglish!: boolean

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProfessorResDto)
    professors!: ProfessorResDto[]

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ClassResDto)
    classes!: ClassResDto[]

    examTimes!: ExamTimeResDto[]

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    classDuration!: number

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    expDuration!: number
  }

  export class GetResDto {
    lectures!: LectureResDto[]
  }

  export class UpdateLectureReqDto {
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    lectureId!: number

    @IsString()
    @IsIn(['add', 'delete'])
    @Type(() => String)
    action!: 'add' | 'delete'
  }

  export class UpdateLectureResDto {
    @IsString()
    @Type(() => String)
    message!: string
  }

  export class CreateReqDto {
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    year!: number

    @IsNumber()
    @Min(1)
    @Max(4)
    @Type(() => Number)
    semester!: number

    @IsArray()
    @IsNumber({}, { each: true })
    lectureIds!: number[]
  }

  export class CreateResDto {
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    id!: number
  }

  export class MyTimetableReqDto {
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

  export class MyTimetableResDto extends GetResDto {}

  export interface TimetableItem {
    id: number
    name: string
    year: number | null
    semester: number | null
    timeTableOrder: number
  }
}
