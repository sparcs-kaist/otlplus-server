import { subject_department } from "../../../prisma/generated/prisma-class/subject_department";
import { DepartmentResponseDto } from "../dto/department/department.response.dto";

export const toJsonDepartment = (department: subject_department, nested=false): DepartmentResponseDto => {
  return {
    "id": department.id,
    "name": department.name,
    "name_en": department.name_en,
    "code": department.code,
  }
}