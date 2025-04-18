import { IDepartment } from '@otl/server-nest/common/interfaces'
import { subject_department } from '@prisma/client'

export const toJsonDepartment = (department: subject_department, _nested = false): IDepartment.Basic => ({
  id: department.id,
  name: department.name,
  name_en: department.name_en ?? '',
  code: department.code,
})
