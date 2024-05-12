import { Prisma, review_reviewvote } from '@prisma/client';
import { IPrismaMiddleware } from 'src/common/interfaces/IPrismaMiddleware';
import { PrismaService } from '../prisma.service';

export class ReviewVoteMiddleware
  implements IPrismaMiddleware.IPrismaMiddleware<false>
{
  private static instance: ReviewVoteMiddleware;

  constructor(
    private prisma: PrismaService, //private readonly courseRepository: CourseRepository, //private readonly lectureRepository: LectureRepository, //private readonly professorRepositiry: ProfessorRepositiry,
  ) {}
  async execute(
    params: Prisma.MiddlewareParams,
    result: any,
  ): Promise<boolean> {
    if (
      params.action === 'create' ||
      params.action === 'update' ||
      params.action === 'upsert'
    ) {
      await this.reviewVoteSavedMiddleware(result);
      return true;
    } else if (params.action === 'delete') {
      await this.reviewVoteDeletedMiddleware(result);
      return true;
    }
    return true;
  }
  public static getInstance(prisma: PrismaService): ReviewVoteMiddleware {
    if (!this.instance) {
      this.instance = new ReviewVoteMiddleware(prisma);
    }
    return this.instance;
  }

  private async reviewRecalcLike(reviewVote: review_reviewvote) {
    const count = await this.prisma.review_reviewvote.count({
      where: { review_id: reviewVote.review_id },
    });
    await this.prisma.review_review.update({
      where: { id: reviewVote.review_id },
      data: { like: count },
    });
  }

  private async reviewVoteSavedMiddleware(result: any) {
    await this.reviewRecalcLike(result);
  }

  private async reviewVoteDeletedMiddleware(result: any) {
    await this.reviewRecalcLike(result);
  }
}
