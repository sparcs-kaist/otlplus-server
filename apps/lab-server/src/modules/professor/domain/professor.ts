import { Department } from '@otl/lab-server/modules/department/domain/department'

export class Professor {
  id!: string

  name!: string

  eid!: string

  orcid!: string

  rid!: string

  department!: Department
}
