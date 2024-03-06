import { Type } from 'class-transformer';
import { IsInt, IsString } from 'class-validator';
import { ClasstimeDto } from './dto/lecture/classtime.response.dto';
import { ExamtimeDto } from './dto/lecture/examtime.response.dto';

export namespace ILecture {
  export class AutocompleteDto {
    @IsInt()
    @Type(() => Number)
    year!: number;

    @IsInt()
    @Type(() => Number)
    semester!: number;

    @IsString()
    keyword!: string;
  }

  export interface Response {
    id: number;
    title: string;
    title_en: string;
    course: number;
    old_code: string;
    class_no: string;
    year: number;
    semester: number;
    code: string;
    department: number;
    department_code: string;
    department_name: string;
    department_name_en: string;
    type: string;
    type_en: string;
    limit: number;
    num_people: number;
    is_english: boolean;
    num_classes: number;
    num_labs: number;
    credit: number;
    credit_au: number;
    common_title: string;
    common_title_en: string;
    class_title: string;
    class_title_en: string;
    review_total_weight: number;
  }

  export interface DetailedResponse extends Response {
    grade?: number;
    load?: number;
    speech?: number;
    classtimes?: ClasstimeDto;
    examtimes?: ExamtimeDto;
  }
}
