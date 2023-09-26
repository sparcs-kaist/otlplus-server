import { ClasstimeDto } from './classtime.response.dto';
import { ExamtimeDto } from './examtime.response.dto';

export interface NestedLectureResponseDto {
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

export interface LectureResponseDto extends NestedLectureResponseDto {
  grade?: number;
  load?: number;
  speech?: number;
  classtimes?: ClasstimeDto;
  examtimes?: ExamtimeDto;
}
