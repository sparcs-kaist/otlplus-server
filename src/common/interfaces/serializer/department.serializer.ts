import { subject_department } from "@prisma/client";
import { DepartmentResponseDto } from "../dto/department/department.response.dto";

export const toJsonDepartment = (department: subject_department, nested=false): DepartmentResponseDto => {


  return department ? {
    "id": department.id,
    "name": department.name,
    "name_en": department.name_en,
    "code": department.code,
  } : null;
}