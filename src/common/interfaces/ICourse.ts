import { IsString } from 'class-validator';
import { DepartmentResponseDto } from './dto/department/department.response.dto';
import { IDepartment } from './IDepartment';
import {
  CourseResponseDto,
  CourseResponseDtoNested,
} from './dto/course/course.response.dto';
import { ProfessorResponseDto } from './dto/professor/professor.response.dto';
import { IProfessor } from './IProfessor';

export namespace ICourse {
  export interface Basic {
    id: number;
    old_code: string;
    department_id: number;
    type: string;
    type_en: string;
    title: string;
    title_en: string;
    summary: string;
    grade_sum: number;
    load_sum: number;
    speech_sum: number;
    review_total_weight: number;
    grade: number;
    load: number;
    speech: number;
    title_en_no_space: string;
    title_no_space: string;
  }

  export interface Response {
    id: number;
    old_code: string;
    department: IDepartment.Basic;
    type: string;
    type_en: string;
    title: string;
    title_en: string;
    summary: string;
    review_total_weight: number;
    credit: number;
    credit_au: number;
    num_classes: number;
    num_labs: number;
  }

  export interface DetailResponse extends Response {
    related_courses_prior?: Response[];
    related_courses_posterior?: Response[];
    professors?: IProfessor.Basic[];
    grade?: number;
    load?: number;
    speech?: number;
  }

  export interface Related extends Basic {
    related_courses_prior: Basic[];
    related_courses_posterior: Basic[];
  }

  export class AutocompleteDto {
    @IsString()
    keyword!: string;
  }
}
