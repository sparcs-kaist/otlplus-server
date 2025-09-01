import { Department } from '@otl/server-nest/modules/departments/domain/department'

import { EDepartment } from '@otl/prisma-client/entities'

export function mapDepartment(department: EDepartment.Basic): Department {
  return {
    numId: department.num_id,
    nameEn: department.name_en,
    ...department,
  }
}
