import { Type } from 'class-transformer';
import { IsInt, IsString } from 'class-validator';
import { IProfessor } from './IProfessor';

export namespace ILecture {
  export interface Classtime {
    building_code: string;
    room_name: string;
    classroom: string;
    classroom_en: string;
    classroom_short: string;
    classroom_short_en: string;
    day: number;
    begin: number;
    end: number;
  }

  export interface ExamTime {
    day: number;
    str: string;
    str_en: string;
    begin: number;
    end: number;
  }

  export interface Basic {
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
    professors: IProfessor.Basic[];
  }

  export interface Detail extends Basic {
    grade: number;
    load: number;
    speech: number;
    classtimes: Classtime[];
    examtimes: ExamTime[];
  }

  export class AutocompleteQuery {
    @IsInt()
    @Type(() => Number)
    year!: number;

    @IsInt()
    @Type(() => Number)
    semester!: number;

    @IsString()
    keyword!: string;
  }
}
