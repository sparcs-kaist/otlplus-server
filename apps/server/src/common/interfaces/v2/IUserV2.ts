import { Type } from 'class-transformer'
import {
  IsArray, IsBoolean, IsNumber, IsString, Min, ValidateNested,
} from 'class-validator'

export namespace IUserV2 {
  export class ProfessorItem {
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    id!: number

    @IsString()
    @Type(() => String)
    name!: string
  }

  export class LectureItem {
    @IsString()
    @Type(() => String)
    name!: string

    @IsString()
    @Type(() => String)
    code!: string

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    courseId!: number

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    lectureId!: number

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProfessorItem)
    professors!: ProfessorItem[]

    @IsBoolean()
    @Type(() => Boolean)
    written!: boolean
  }

  export class LecturesWrap {
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    year!: number

    @IsNumber()
    @Min(1)
    @Type(() => Number)
    semester!: number

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LectureItem)
    lectures!: LectureItem[]
  }

  export class LecturesResponse {
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    totalLecturesCount!: number

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    reviewedLecturesCount!: number

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    totalLikesCount!: number

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LecturesWrap)
    lecturesWrap!: LecturesWrap[]
  }
}
