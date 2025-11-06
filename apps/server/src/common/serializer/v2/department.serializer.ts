import { Language } from '@otl/server-nest/common/decorators/get-language.decorator'
import { IDepartmentV2 } from '@otl/server-nest/common/interfaces/v2'
import { subject_department } from '@prisma/client'

export const toJsonDepartmentV2 = (department: subject_department, language: Language): IDepartmentV2.Detail => ({
  id: department.id,
  name: language === 'en' && department.name_en ? department.name_en : department.name,
  code: department.code,
})
