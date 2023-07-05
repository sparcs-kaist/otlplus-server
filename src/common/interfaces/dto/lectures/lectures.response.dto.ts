import { Type } from "class-transformer"
import { IsNotEmpty, IsInt, IsNumber, IsString, IsBoolean, ValidateNested } from "class-validator"


class LectureProfessorDto {
  @IsNotEmpty()
  name: string

  @IsNotEmpty()
  name_en: string

  @IsInt()
  @IsNotEmpty()
  professor_id: number

  @IsNumber()
  @IsNotEmpty()
  review_total_weight: number
}

class LectureExamtimeDto {
  @IsInt()
  @IsNotEmpty()
  day: number

  @IsNotEmpty()
  str: string

  @IsNotEmpty()
  str_en: string

  @IsInt()
  @IsNotEmpty()
  begin: number

  @IsInt()
  @IsNotEmpty()
  end: number
}

class LectureClasstimeDto {
  @IsNotEmpty()
  room_name: string

  @IsNotEmpty()
  classroom: string

  @IsNotEmpty()
  classroom_en: string

  @IsNotEmpty()
  classroom_short: string

  @IsNotEmpty()
  classroom_short_en: string

  @IsNotEmpty()
  building_code: string

  @IsInt()
  @IsNotEmpty()
  day: number

  @IsInt()
  @IsNotEmpty()
  begin: number

  @IsInt()
  @IsNotEmpty()
  end: number
}

export class LectureInstanceDto {
  @IsInt()
  @IsNotEmpty()
  id: number

  @IsString()
  @IsNotEmpty()
  type: string

  @IsString()
  @IsNotEmpty()
  type_en: string

  @IsString()
  @IsNotEmpty()
  code: string

  @IsString()
  @IsNotEmpty()
  old_code: string

  @IsInt()
  @IsNotEmpty()
  course: number

  @IsInt()
  @IsNotEmpty()
  department: number

  @IsString()
  @IsNotEmpty()
  department_code: string

  @IsString()
  @IsNotEmpty()
  department_name: string

  @IsString()
  @IsNotEmpty()
  department_name_en: string

  @IsString()
  @IsNotEmpty()
  title: string

  @IsString()
  @IsNotEmpty()
  title_en: string

  @IsInt()
  @IsNotEmpty()
  year: number

  @IsInt()
  @IsNotEmpty()
  semester: number

  @IsString()
  @IsNotEmpty()
  class_no: string

  @IsInt()
  @IsNotEmpty()
  limit: number

  @IsInt()
  num_people?: number

  @IsBoolean()
  @IsNotEmpty()
  is_english: boolean

  @IsInt()
  @IsNotEmpty()
  num_classes: number

  @IsInt()
  @IsNotEmpty()
  num_labs: number

  @IsInt()
  @IsNotEmpty()
  credit: number

  @IsInt()
  @IsNotEmpty()
  credit_au: number

  @IsNumber()
  @IsNotEmpty()
  grade: number

  @IsNumber()
  @IsNotEmpty()
  load: number

  @IsNumber()
  @IsNotEmpty()
  speech: number

  @IsNumber()
  @IsNotEmpty()
  review_total_weight: number

  @IsString()
  class_title?: string

  @IsString()
  class_title_en?: string

  @IsString()
  common_title?: string

  @IsString()
  common_title_en?: string

  @Type(() => LectureProfessorDto)
  @ValidateNested({ each: true })
  professors: LectureProfessorDto[]

  @Type(() => LectureExamtimeDto)
  @ValidateNested({ each: true })
  examtimes: LectureExamtimeDto[]

  @Type(() => LectureClasstimeDto)
  @ValidateNested({ each: true })
  classtimes: LectureClasstimeDto[]
}
