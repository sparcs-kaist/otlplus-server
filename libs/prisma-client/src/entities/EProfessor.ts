import { Prisma } from '@prisma/client'

import { EDepartment } from '@otl/prisma-client/entities/EDepartment'

export namespace EProfessor {
  export type Basic = Prisma.subject_professorGetPayload<Prisma.subject_professorDefaultArgs>

  export const Basic = Prisma.validator<Prisma.subject_professorDefaultArgs>()({})

  type _WithDepartment = Basic & {
    subject_department?: EDepartment.Basic
  }
}
