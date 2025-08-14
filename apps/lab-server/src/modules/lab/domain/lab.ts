import { Department } from '@otl/lab-server/modules/department/domain/department'
import { Field } from '@otl/lab-server/modules/field/domain/field'
import { Professor } from '@otl/lab-server/modules/professor/domain/professor'

export class Lab {
  id!: string

  name?: string

  professor!: Professor

  department!: Department

  fields!: Field[]

  labLink!: string
}
