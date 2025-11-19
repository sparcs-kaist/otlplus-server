/**
 * Type definitions for OTL Plus API responses
 */

export interface Course {
  id: number;
  old_code: string;
  department: Department;
  type: string;
  type_en: string;
  title: string;
  title_en: string;
  summary: string;
  grade_sum: number;
  load_sum: number;
  speech_sum: number;
  review_total_weight: number;
  professor_name?: string;
  professors?: Professor[];
}

export interface Department {
  id: number;
  name: string;
  name_en: string;
  code: string;
}

export interface Professor {
  id: number;
  name: string;
  name_en: string;
  professor_name?: string;
}

export interface Lecture {
  id: number;
  course: number;
  title: string;
  title_en: string;
  course_title: string;
  course_title_en: string;
  instructor: string;
  year: number;
  semester: number;
  code: string;
  department: Department;
  class_no: string;
  grade: number;
  load: number;
  speech: number;
  review_total_weight: number;
}

export interface Review {
  id: number;
  course: number;
  lecture: number;
  content: string;
  like: number;
  is_deleted: boolean;
  grade: number;
  load: number;
  speech: number;
  created_datetime: string;
  updated_datetime: string;
}

export interface SearchCoursesParams {
  keyword?: string;
  department?: number;
  type?: string;
  grade?: number;
  term?: number[];
  day?: number[];
  begin?: number;
  end?: number;
  unit?: number;
  level?: number;
  limit?: number;
  offset?: number;
  order?: string[];
}

export interface SearchLecturesParams {
  keyword?: string;
  year?: number;
  semester?: number;
  department?: number;
  type?: string;
  grade?: number;
  term?: number[];
  day?: number[];
  begin?: number;
  end?: number;
  unit?: number;
  level?: number;
  limit?: number;
  offset?: number;
  order?: string[];
}

export interface SearchReviewsParams {
  lecture_year?: number;
  lecture_semester?: number;
  order?: string[];
  limit?: number;
  offset?: number;
}
