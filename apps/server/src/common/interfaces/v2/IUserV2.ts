import {
  IsArray, IsBoolean, IsNumber, IsString, Min, ValidateNested,
} from 'class-validator'

export namespace IUserV2 {
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
}
