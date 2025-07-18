import { Inject, Injectable } from '@nestjs/common'
import { LectureService } from '@otl/server-consumer/modules/lecture/lecture.service'
import { LECTURE_REPOSITORY, ServerConsumerLectureRepository } from '@otl/server-consumer/out/lecture.repository'
import { PROFESSOR_REPOSITORY, ServerConsumerProfessorRepository } from '@otl/server-consumer/out/professor.repository'
import { REVIEW_REPOSITORY, ServerConsumerReviewRepository } from '@otl/server-consumer/out/review.repository'

@Injectable()
export class ProfessorService {
  constructor(
    @Inject(LECTURE_REPOSITORY)
    private readonly lectureRepository: ServerConsumerLectureRepository,
    @Inject(PROFESSOR_REPOSITORY)
    private readonly professorRepository: ServerConsumerProfessorRepository,
    @Inject(REVIEW_REPOSITORY)
    private readonly reviewRepository: ServerConsumerReviewRepository,
    private readonly lectureService: LectureService,
  ) {}

  async updateScore(professorId: number) {
    const reviewsWithLecture = await this.reviewRepository.getRelatedReviewsByProfessorId(professorId)
    const grades = await this.lectureService.lectureCalcAverage(reviewsWithLecture)
    const professor = this.professorRepository.updateProfessorScore(professorId, grades)
    if (!professor) {
      throw new Error(`Failed to update professor score for professorId: ${professorId}`)
    }
    return true
  }
}
