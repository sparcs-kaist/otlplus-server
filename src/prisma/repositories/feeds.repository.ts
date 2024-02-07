import { Injectable } from '@nestjs/common';
import {
  main_ratedailyuserfeed,
  main_relatedcoursedailyuserfeed,
  main_reviewwritedailyuserfeed,
  review_humanitybestreview,
  review_majorbestreview,
  subject_department,
} from '@prisma/client';
import { EFeed } from 'src/common/entites/EFeed';
import {
  FeedRateMinDays,
  FeedVisibleRate,
} from 'src/common/interfaces/constants/feed';
import { getRandomChoice } from 'src/common/utils/method.utils';
import { PrismaService } from '../prisma.service';
import { UserRepository } from './user.repository';

@Injectable()
export class FeedsRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userRepository: UserRepository,
  ) {}

  public async getOrCreateFamousHumanityReview(date: Date) {
    let feed = await this.prisma.main_famoushumanityreviewdailyfeed.findFirst({
      where: {
        date,
      },
      include: EFeed.EFamousHumanityReviewDetails.include,
    });

    if (!feed) {
      // Prisma does not support RAND() in ORDER BY.
      const humanityBestReviews = (await this.prisma.$queryRaw`
        SELECT * FROM review_humanitybestreview 
        ORDER BY RAND() 
        LIMIT 3`) satisfies review_humanitybestreview;

      feed = await this.prisma.main_famoushumanityreviewdailyfeed.create({
        include: EFeed.EFamousHumanityReviewDetails.include,
        data: {
          date,
          priority: Math.random(),
          main_famoushumanityreviewdailyfeed_reviews: {
            createMany: {
              data: humanityBestReviews,
            },
          },
          visible: Math.random() < FeedVisibleRate.FamousHumanityReview,
        },
      });
    }

    return feed;
  }

  public async getOrCreateRankedReview(date: Date) {
    let feed = await this.prisma.main_rankedreviewdailyfeed.findFirst({
      where: {
        date,
      },
    });

    if (!feed) {
      feed = await this.prisma.main_rankedreviewdailyfeed.create({
        data: {
          date,
          priority: Math.random(),
          visible: Math.random() < FeedVisibleRate.RankedReview,
        },
      });
    }

    return feed;
  }

  public async getOrCreateFamousMajorReview(
    date: Date,
    subject_department: subject_department,
    departmentNum: number = 1,
  ) {
    let feed = await this.prisma.main_famousmajorreviewdailyfeed.findFirst({
      include: EFeed.EFamousMajorReviewDetails.include,
      where: {
        date,
        subject_department,
      },
    });

    if (!feed) {
      // Prisma does not support RAND() in ORDER BY.
      const majorBestReviews = (await this.prisma.$queryRaw`
        SELECT mbr.* FROM review_majorbestreview mbr
        INNER JOIN review_review r ON r.id = mbr.review_id
        INNER JOIN subject_lecture l ON l.id = r.lecture_id
        WHERE l.department_id = ${subject_department.id}
        ORDER BY RAND() 
        LIMIT 3`) satisfies review_majorbestreview;

      feed = await this.prisma.main_famousmajorreviewdailyfeed.create({
        include: EFeed.EFamousMajorReviewDetails.include,
        data: {
          date,
          priority: Math.random(),
          visible:
            Math.random() <
            FeedVisibleRate.FamousMajorReview / departmentNum ** 0.7,
          department_id: subject_department.id,
          main_famousmajorreviewdailyfeed_reviews: {
            createMany: { data: majorBestReviews },
          },
        },
      });
    }

    return feed;
  }

  public async getOrCreateReviewWrite(
    date: Date,
    userId: number,
  ): Promise<main_reviewwritedailyuserfeed | null> {
    let feed = await this.prisma.main_reviewwritedailyuserfeed.findFirst({
      include: EFeed.EReviewWriteDetails.include,
      where: {
        date,
        user_id: userId,
      },
    });

    if (!feed) {
      const takenLecture = getRandomChoice(
        await this.userRepository.getReviewWritableTakenLectures(userId),
      );
      if (!takenLecture) {
        return null;
      }

      feed = await this.prisma.main_reviewwritedailyuserfeed.create({
        include: EFeed.EReviewWriteDetails.include,
        data: {
          date,
          priority: Math.random(),
          visible: Math.random() < FeedVisibleRate.ReviewWrite,
          user_id: userId,
          lecture_id: takenLecture.lecture_id,
        },
      });
    }

    return feed;
  }

  public async getOrCreateRelatedCourse(
    date: Date,
    userId: number,
  ): Promise<main_relatedcoursedailyuserfeed | null> {
    let feed = await this.prisma.main_relatedcoursedailyuserfeed.findFirst({
      include: EFeed.ERelatedCourseDetails.include,
      where: {
        date,
        user_id: userId,
      },
    });

    if (!feed) {
      const takenLecture = getRandomChoice(
        await this.prisma.session_userprofile_taken_lectures.findMany({
          include: {
            lecture: true,
          },
          where: {
            userprofile_id: userId,
          },
        }),
      );

      if (!takenLecture) {
        return null;
      }

      feed = await this.prisma.main_relatedcoursedailyuserfeed.create({
        include: EFeed.ERelatedCourseDetails.include,
        data: {
          date,
          priority: Math.random(),
          visible: Math.random() < FeedVisibleRate.RelatedCourse,
          course_id: takenLecture.lecture.course_id,
          user_id: userId,
        },
      });
    }

    return feed;
  }

  public async getOrCreateRate(
    date: Date,
    userId: number,
  ): Promise<main_ratedailyuserfeed | null> {
    let feed = await this.prisma.main_ratedailyuserfeed.findFirst({
      where: {
        date,
        user_id: userId,
      },
    });

    if (!feed) {
      if (
        await this.prisma.support_rate.findFirst({
          where: {
            user_id: userId,
            year: date.getFullYear(),
          },
        })
      ) {
        return null;
      }

      const beforeDate = new Date(date);
      beforeDate.setDate(date.getDate() - FeedRateMinDays);
      const afterDate = new Date(date);
      afterDate.setDate(date.getDate() + FeedRateMinDays);
      const weekFeeds = await this.prisma.main_ratedailyuserfeed.findMany({
        where: {
          date: {
            gt: beforeDate,
            lt: afterDate,
          },
          visible: true,
          user_id: userId,
        },
      });
      if (weekFeeds.length > 0) {
        return null;
      }

      feed = await this.prisma.main_ratedailyuserfeed.create({
        data: {
          date,
          priority: Math.random(),
          visible: Math.random() < FeedVisibleRate.Rate,
          user_id: userId,
        },
      });
    }

    return feed;
  }
}
