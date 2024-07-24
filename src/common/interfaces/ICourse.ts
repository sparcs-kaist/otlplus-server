import { IsString } from 'class-validator';
import { IDepartment } from './IDepartment';
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

  export interface ForPlanner {
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

  export interface DetailForPlanner extends ForPlanner {
    related_courses_prior?: ForPlanner[];
    related_courses_posterior?: ForPlanner[];
    professors?: IProfessor.Basic[];
    grade?: number;
    load?: number;
    speech?: number;
  }

  export interface Related extends Basic {
    related_courses_prior: Basic[];
    related_courses_posterior: Basic[];
  }

  export class AutocompleteQuery {
    @IsString()
    keyword!: string;
  }
}
