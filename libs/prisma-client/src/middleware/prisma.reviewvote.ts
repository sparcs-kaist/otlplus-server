import { review_reviewvote } from '@prisma/client'

import { PrismaService } from '@otl/prisma-client/prisma.service'

import { IPrismaMiddleware } from './IPrismaMiddleware'

export class ReviewVoteMiddleware implements IPrismaMiddleware.Middleware {
  private static instance: ReviewVoteMiddleware

  private prisma: PrismaService

  constructor(
    prisma: PrismaService, // private readonly courseRepository: CourseRepository, //private readonly lectureRepository: LectureRepository, //private readonly professorRepositiry: ProfessorRepositiry,
  ) {
    this.prisma = prisma
  }

  async preExecute(_operations: IPrismaMiddleware.operationType, _args: any): Promise<boolean> {
    return true
  }

  async postExecute(operatoins: IPrismaMiddleware.operationType, args: any, result: any): Promise<boolean> {
    if (operatoins === 'create' || operatoins === 'update' || operatoins === 'upsert') {
      await this.reviewVoteSavedMiddleware(result)
      return true
    }
    if (operatoins === 'delete') {
      await this.reviewVoteDeletedMiddleware(result)
      return true
    }
    return true
  }

  static initialize(prisma: PrismaService) {
    if (!ReviewVoteMiddleware.instance) {
      ReviewVoteMiddleware.instance = new ReviewVoteMiddleware(prisma)
    }
  }

  static getInstance(): ReviewVoteMiddleware {
    return ReviewVoteMiddleware.instance
  }

  private async reviewRecalcLike(reviewVote: review_reviewvote) {
    await this.prisma.review_review.update({
      where: { id: reviewVote.review_id },
      data: {
        like: await this.prisma.review_reviewvote.count({
          where: { review_id: reviewVote.review_id },
        }),
      },
    })
  }

  private async reviewVoteSavedMiddleware(result: any) {
    await this.reviewRecalcLike(result)
  }

  private async reviewVoteDeletedMiddleware(result: any) {
    await this.reviewRecalcLike(result)
  }
}
