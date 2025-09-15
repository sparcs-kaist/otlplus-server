import { Injectable } from '@nestjs/common'
import { ServerConsumerProfessorRepository } from '@otl/server-consumer/out/professor.repository'
import { ProfessorBasic, ProfessorScore } from '@otl/server-nest/modules/professor/domain/professor'

import { mapProfessor } from '@otl/prisma-client/common/mapper/professor'
import { PrismaReadService } from '@otl/prisma-client/prisma.read.service'
import { PrismaService } from '@otl/prisma-client/prisma.service'

@Injectable()
export class ProfessorRepository implements ServerConsumerProfessorRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaRead: PrismaReadService,
  ) {}

  /**
   * Finds professors by lecture ID.
   * @param id - The ID of the lecture.
   * @returns A promise that resolves to an array of ProfessorBasic objects.
   */
  async findProfessorsByLectureId(id: number): Promise<ProfessorBasic[]> {
    const subjectLectureProfessors = await this.prismaRead.subject_lecture_professors.findMany({
      where: { lecture: { id } },
    })

    if (subjectLectureProfessors.length === 0) {
      return []
    }
    // Extracting unique professor IDs from the subjectLectureProfessors
    const professorIds = subjectLectureProfessors.map((slp) => slp.professor_id)

    const professors = await this.prismaRead.subject_professor.findMany({
      where: {
        id: { in: professorIds },
      },
    })

    return professors.map((professor) => mapProfessor(professor))
  }

  async updateProfessorScore(
    professorId: number,
    grades: ProfessorScore & { reviewNum: number },
  ): Promise<ProfessorBasic> {
    return mapProfessor(
      await this.prisma.subject_professor.update({
        where: { id: professorId },
        data: {
          review_total_weight: grades.reviewTotalWeight,
          grade_sum: grades.gradeSum,
          load_sum: grades.loadSum,
          speech_sum: grades.speechSum,
          grade: grades.grade,
          load: grades.load,
          speech: grades.speech,
        },
      }),
    )
  }
}
