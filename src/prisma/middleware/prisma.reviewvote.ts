import { Injectable } from '@nestjs/common';
import { Prisma, review_reviewvote } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ReviewVoteMiddleware {
  constructor(
    private prisma: PrismaService, //private readonly courseRepository: CourseRepository, //private readonly lectureRepository: LectureRepository, //private readonly professorRepositiry: ProfessorRepositiry,
  ) {}
  async execute(params: Prisma.MiddlewareParams, result: any) {
    if (
      params.action === 'create' ||
      params.action === 'update' ||
      params.action === 'upsert'
    ) {
      await this.reviewVoteSavedMiddleware(result);
    } else if (params.action === 'delete') {
      await this.reviewVoteDeletedMiddleware(result);
    }
  }

  async reviewRecalcLike(reviewVote: review_reviewvote) {
    const count = await this.prisma.review_reviewvote.count({
      where: { review_id: reviewVote.review_id },
    });
    await this.prisma.review_review.update({
      where: { id: reviewVote.review_id },
      data: { like: count },
    });
  }

  async reviewVoteSavedMiddleware(result: any) {
    //reviewvote와 관련된 함수들은 무조건 review를 include해서 반환하도록 하면 안되는건가?
    await this.reviewRecalcLike(result);
  }

  async reviewVoteDeletedMiddleware(result: any) {
    //그냥 reviewvote와 관련된 함수들은 무조건 review를 include해서 반환하도록 하면 안되는건가?
    await this.reviewRecalcLike(result);
  }
}
