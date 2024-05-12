import { Prisma, review_review, subject_lecture } from '@prisma/client';
import { IPrismaMiddleware } from 'src/common/interfaces/IPrismaMiddleware';
import { IReview } from 'src/common/interfaces/IReview';
import { PrismaService } from '../prisma.service';

export class LectureProfessorsMiddleware
  implements IPrismaMiddleware.IPrismaMiddleware<false>
{
  private static instance: LectureProfessorsMiddleware;

  constructor(private prisma: PrismaService) {}

  async execute(
    params: Prisma.MiddlewareParams,
    result: any,
  ): Promise<boolean> {
    if (params.action === 'create') {
      const lectureId = result.lecture_id;
      const lecture = await this.prisma.subject_lecture.findUniqueOrThrow({
        where: { id: lectureId },
      });
      await this.lectureRecalcScore(lecture);
      return true;
    } else if (params.action === 'delete' || params.action === 'deleteMany') {
      const lectureId = result.lecture_id;
      const lecture = await this.prisma.subject_lecture.findUniqueOrThrow({
        where: { id: lectureId },
      });
      await this.lectureRecalcScore(lecture);
      return true;
    }
    return true;
  }

  static getInstance(prisma: PrismaService): LectureProfessorsMiddleware {
    if (!this.instance) {
      this.instance = new LectureProfessorsMiddleware(prisma);
    }
    return this.instance;
  }

  private async lectureRecalcScore(lecture: subject_lecture) {
    const professors = await this.prisma.subject_professor.findMany({
      where: {
        subject_lecture_professors: {
          some: { lecture: { id: lecture.id } },
        },
      },
    });
    const professorsId = professors.map((result) => result.id);
    const reviews = await this.prisma.review_review.findMany({
      where: {
        lecture: {
          AND: [
            {
              course: {
                id: lecture.course_id,
              },
            },
            {
              subject_lecture_professors: {
                some: {
                  professor: {
                    id: { in: professorsId },
                  },
                },
              },
            },
          ],
        },
      },
    });
    const grades = await this.lectureCalcAverage(reviews);
    await this.prisma.subject_lecture.update({
      where: { id: lecture.id },
      data: {
        review_total_weight: grades.totalWeight,
        grade_sum: grades.sums.gradeSum,
        load_sum: grades.sums.loadSum,
        speech_sum: grades.sums.speechSum,
        grade: grades.avgs.grade,
        load: grades.avgs.load,
        speech: grades.avgs.speech,
      },
    });
  }

  private async lectureCalcAverage(
    reviews: review_review[],
  ): Promise<IReview.reCalcScoreReturn> {
    const nonzeroReviews = reviews.filter(
      (review) =>
        review.grade !== 0 || review.load !== 0 || review.speech !== 0,
    );
    const reducedNonzero = await Promise.all(
      nonzeroReviews.map(async (review) => {
        const weight = await this.lectureGetWeight(review);
        return {
          weight,
          grade: review.grade,
          speech: review.speech,
          load: review.load,
        };
      }),
    );
    const reviewNum = reviews.length;
    const totalWeight = reducedNonzero.reduce((acc, r) => acc + r.weight, 0);
    const gradeSum = reducedNonzero.reduce(
      (acc, r) => acc + r.weight * r.grade * 3,
      0,
    );
    const loadSum = reducedNonzero.reduce(
      (acc, r) => acc + r.weight * r.load * 3,
      0,
    );
    const speechSum = reducedNonzero.reduce(
      (acc, r) => acc + r.weight * r.speech * 3,
      0,
    );

    const grade = totalWeight !== 0 ? gradeSum / totalWeight : 0.0;
    const load = totalWeight !== 0 ? loadSum / totalWeight : 0.0;
    const speech = totalWeight !== 0 ? speechSum / totalWeight : 0.0;

    return {
      reviewNum,
      totalWeight,
      sums: {
        gradeSum,
        loadSum,
        speechSum,
      },
      avgs: {
        grade,
        load,
        speech,
      },
    };
  }

  private async lectureGetWeight(review: review_review): Promise<number> {
    const baseYear = new Date().getFullYear();
    const lectureYear: number = (
      await this.prisma.subject_lecture.findUniqueOrThrow({
        where: { id: review.id },
        select: {
          year: true,
        },
      })
    ).year;
    const yearDiff = baseYear > lectureYear ? baseYear - lectureYear : 0;
    return (Math.sqrt(review.like) + 2) * 0.85 ** yearDiff;
  }
}
