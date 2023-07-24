import { subject_course } from "../../../../prisma/generated/prisma-class/subject_course";

export interface ProfessorResponseDto {
  name: string;
  name_en: string;
  professor_id: number;
  review_total_weight: number;
}