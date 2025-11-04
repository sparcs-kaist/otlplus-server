import { IDepartmentV2 } from '@otl/server-nest/common/interfaces/v2/IDepartmentV2'
import { subject_department } from '@prisma/client'

export const toJsonDepartmentV2 = (department: subject_department, language: 'ko' | 'en'): IDepartmentV2.Basic => ({
  id: department.id,
  name: language === 'en' && department.name_en ? department.name_en : department.name,
  code: department.code,
})
