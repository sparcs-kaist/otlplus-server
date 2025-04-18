import { Prisma } from '@prisma/client'

export namespace EProfessor {
  export type Basic = Prisma.subject_professorGetPayload<Prisma.subject_professorDefaultArgs>
}
