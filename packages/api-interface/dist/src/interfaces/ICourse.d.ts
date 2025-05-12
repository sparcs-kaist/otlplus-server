import { IDepartment } from '@otl/api-interface/src/interfaces/IDepartment';
import { IProfessor } from '@otl/api-interface/src/interfaces/IProfessor';
export declare namespace ICourse {
  interface Basic {
    id: number;
    old_code: string;
    old_old_code: string;
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
  interface Detail extends Basic {
    related_courses_prior: Basic[];
    related_courses_posterior: Basic[];
    professors: IProfessor.Basic[];
    grade: number;
    load: number;
    speech: number;
  }
  interface DetailWithIsRead extends Detail {
    userspecific_is_read: boolean;
  }
  namespace ICourseUser {
    interface Basic {
      id: number;
      latest_read_datetime: Date;
      course_id: number;
      user_profile_id: number;
    }
  }
  interface FeedBasic {
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
  interface FeedRelated extends FeedBasic {
    related_courses_prior: FeedBasic[];
    related_courses_posterior: FeedBasic[];
  }
  class AutocompleteQueryDto {
    keyword: string;
  }
  class Query {
    department?: string[];
    type?: string[];
    level?: string[];
    group?: string[];
    keyword?: string;
    term?: string[];
    order?: string[];
    offset?: number;
    limit?: number;
  }
  class LectureQueryDto {
    order?: string[];
  }
  class ReviewQueryDto {
    order?: string[];
    offset?: number;
    limit?: number;
  }
}
