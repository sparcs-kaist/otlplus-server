import { Injectable } from '@nestjs/common';
import {
  Prisma,
  review_review,
  review_reviewvote,
  subject_course,
  subject_lecture,
  subject_professor,
} from '@prisma/client';
import { IReview } from 'src/common/interfaces/IReview';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ReviewMiddleware {
  private prisma: PrismaService;

  constructor(prismaService: PrismaService) {
    this.prisma = prismaService;
  }

  async lectureRecalcScore(lecture: subject_lecture) {
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

  async lectureCalcAverage(
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

  async lectureGetWeight(review: review_review): Promise<number> {
    const baseYear = new Date().getFullYear();
    const lectureYear: number =
      (
        await this.prisma.subject_lecture.findUnique({
          where: { id: review.id },
          select: {
            year: true,
          },
        })
      )?.year ?? 0; // todo: 확인 필요.
    const yearDiff = baseYear > lectureYear ? baseYear - lectureYear : 0;
    return (Math.sqrt(review.like) + 2) * 0.85 ** yearDiff;
  }

  async courseRecalcScore(course: subject_course) {
    const reviews = await this.prisma.review_review.findMany({
      where: {
        lecture: {
          course: {
            id: course.id,
          },
        },
      },
    });
    const grades = await this.lectureCalcAverage(reviews);
    await this.prisma.subject_course.update({
      where: { id: course.id },
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

  async professorRecalcScore(professor: subject_professor) {
    const reviews = await this.prisma.review_review.findMany({
      where: {
        lecture: {
          subject_lecture_professors: {
            some: {
              professor: {
                id: professor.id,
              },
            },
          },
        },
      },
    });
    const grades = await this.lectureCalcAverage(reviews);
    await this.prisma.subject_professor.update({
      where: { id: professor.id },
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

  async recalcRelatedScore(review: review_review) {
    const course = await this.prisma.subject_course.findUnique({
      where: { id: review.course_id },
    });

    const professors = await this.prisma.subject_professor.findMany({
      where: {
        subject_lecture_professors: {
          some: { lecture: { id: review.lecture_id } },
        },
      },
    });

    const professorsId = professors.map((result) => result.id);

    const lectures = await this.prisma.subject_lecture.findMany({
      where: {
        course_id: review.course_id,
        subject_lecture_professors: {
          some: { professor: { id: { in: professorsId } } },
        },
      },
    });
    if (course) {
      await this.courseRecalcScore(course);
    } // todo: 문제가 없나..?
    await Promise.all(
      lectures.map(async (lecture) => await this.lectureRecalcScore(lecture)),
    );
    await Promise.all(
      professors.map(
        async (professor) => await this.professorRecalcScore(professor),
      ),
    );
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
  async reviewSavedMiddleware(result: any, action: string) {
    await this.recalcRelatedScore(result); //내가 여기 왜 result를 넣었을까
    if (action === 'create') {
      const course = await result.course;
      await this.prisma.subject_course.update({
        where: {
          id: course.id,
        },
        data: {
          latest_written_datetime: result.written_datetime,
        },
      });
    } else {
      //todo: caches
    }
  }

  async reviewDeletedMiddleware(result: any) {
    await this.recalcRelatedScore(result);
  }

  public reviewVoteSavedMiddleware(): Prisma.Middleware {
    //reviewvote와 관련된 함수들은 무조건 review를 include해서 반환하도록 하면 안되는건가?
    //await this.reviewRecalcLike(result);
    return async (params: Prisma.MiddlewareParams, next): Promise<any> => {
      if (params.model === 'review_reviewvote') {
        if (
          params.action === 'create' ||
          params.action === 'update' ||
          params.action === 'upsert'
        ) {
          const result = await next(params);
          await this.reviewRecalcLike(result);
          return result;
        }
      }
      return next(params);
    };
  }

  public reviewVoteDeletedMiddleware(): Prisma.Middleware {
    //그냥 reviewvote와 관련된 함수들은 무조건 review를 include해서 반환하도록 하면 안되는건가?
    //await this.reviewRecalcLike(result);
    return async (params: Prisma.MiddlewareParams, next): Promise<any> => {
      if (params.model === 'review_reviewvote') {
        if (params.action === 'delete') {
          const result = await next(params);
          await this.reviewRecalcLike(result);
          return result;
        }
      }
      return next(params);
    };
  }
}
