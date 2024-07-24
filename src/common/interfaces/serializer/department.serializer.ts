import { subject_department } from '@prisma/client';
import { IDepartment } from '../IDepartment';

export const toJsonDepartment = (
  department: subject_department,
  nested = false,
): IDepartment.Basic => {
  return {
    id: department.id,
    name: department.name,
    name_en: department.name_en ?? '',
    code: department.code,
  };
};
