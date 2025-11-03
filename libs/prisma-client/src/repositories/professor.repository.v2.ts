import { Injectable } from '@nestjs/common'

import { PrismaReadService } from '@otl/prisma-client/prisma.read.service'
import { PrismaService } from '@otl/prisma-client/prisma.service'

import { EProfessorV2 } from '../entities/EProfessorV2'

@Injectable()
export class ProfessorRepositoryV2 {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaRead: PrismaReadService,
  ) {}

  async getProfessorById(professorId: number): Promise<EProfessorV2.Basic | null> {
    return await this.prismaRead.subject_professor.findUnique({
      where: { id: professorId },
      select: {
        id: true,
        professor_name: true,
        professor_name_en: true,
      },
    })
  }
}
