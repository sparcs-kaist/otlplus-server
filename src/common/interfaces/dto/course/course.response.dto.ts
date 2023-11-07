import { DepartmentResponseDto } from '../department/department.response.dto';
import { ProfessorResponseDto } from '../professor/professor.response.dto';

export interface CourseResponseDto {
  id: number;
  old_code: string;
  department: DepartmentResponseDto;
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

export interface CourseResponseDtoNested extends CourseResponseDto {
  related_courses_prior?: CourseResponseDto[];
  related_courses_posterior?: CourseResponseDto[];
  professors?: ProfessorResponseDto[];
  grade?: number;
  load?: number;
  speech?: number;
}
