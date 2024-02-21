import { IsString } from 'class-validator';

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

  export interface Related extends Basic {
    related_courses_prior: Basic[];
    related_courses_posterior: Basic[];
  }

  export class AutocompleteDto {
    @IsString()
    keyword!: string;
  }
}
