import { Prisma } from '@prisma/client'

export namespace EProfessorV2 {
  const basicFileds = Prisma.validator<Prisma.subject_professorSelect>()({
    id: true,
    professor_name: true,
    professor_name_en: true,
  })

  export const BasicArgs = Prisma.validator<Prisma.subject_professorDefaultArgs>()({
    select: basicFileds,
  })
  export type Basic = Prisma.subject_professorGetPayload<typeof BasicArgs>
}
