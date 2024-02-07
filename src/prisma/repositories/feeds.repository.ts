import { Injectable } from '@nestjs/common';
import {
  main_ratedailyuserfeed,
  main_relatedcoursedailyuserfeed,
  main_reviewwritedailyuserfeed,
  review_humanitybestreview,
  review_majorbestreview,
  subject_department,
} from '@prisma/client';
import {
  famousHumanityReviewDailyFeed_details,
  famousMajorReviewDailyFeed_Details,
  relatedCourseDailyUserFeed_details,
  reviewWriteDailyUserFeed_details,
} from 'src/common/schemaTypes/feeds';
import { getRandomChoice } from 'src/common/utils/method.utils';
import { PrismaService } from '../prisma.service';

@Injectable()
export class FeedsRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async getOrCreateFamousHumanityReviewDailyFeed(date: Date) {
    let feed = await this.prisma.main_famoushumanityreviewdailyfeed.findFirst({
      where: {
        date,
      },
      include: famousHumanityReviewDailyFeed_details.include,
    });

    if (!feed) {
      // Prisma does not support RAND() in ORDER BY.
      const humanityBestReviews = (await this.prisma.$queryRaw`
        SELECT * FROM review_humanitybestreview 
        ORDER BY RAND() 
        LIMIT 3`) satisfies review_humanitybestreview;

      feed = await this.prisma.main_famoushumanityreviewdailyfeed.create({
        include: famousHumanityReviewDailyFeed_details.include,
        data: {
          date,
          priority: Math.random(),
          main_famoushumanityreviewdailyfeed_reviews: {
            createMany: {
              data: humanityBestReviews,
            },
          },
          visible: Math.random() < 0.5,
        },
      });
    }

    return feed;
  }

  public async getOrCreateRankedReviewDailyFeed(date: Date) {
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
          visible: Math.random() < 0.15,
        },
      });
    }

    return feed;
  }

  public async getOrCreateFamousMajorReviewDailyFeeds(
    date: Date,
    subject_department: subject_department,
  ) {
    let feed = await this.prisma.main_famousmajorreviewdailyfeed.findFirst({
      include: famousMajorReviewDailyFeed_Details.include,
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
        INNER JOIN subject_department d on d.id = l.department_id
        WHERE d.id = ${subject_department.id}
        ORDER BY RAND() 
        LIMIT 3`) satisfies review_majorbestreview;

      feed = await this.prisma.main_famousmajorreviewdailyfeed.create({
        include: famousMajorReviewDailyFeed_Details.include,
        data: {
          date,
          priority: Math.random(),
          visible: Math.random() < 0.6,
          department_id: subject_department.id,
          main_famousmajorreviewdailyfeed_reviews: {
            createMany: { data: majorBestReviews },
          },
        },
      });
    }

    return feed;
  }

  public async getOrCreateReviewWriteDailyUserFeeds(
    date: Date,
    userId: number,
  ): Promise<main_reviewwritedailyuserfeed | null> {
    let feed = await this.prisma.main_reviewwritedailyuserfeed.findFirst({
      include: reviewWriteDailyUserFeed_details.include,
      where: {
        date,
        user_id: userId,
      },
    });

    if (!feed) {
      /**
       * @TODO: add handling writable review
       */
      const takenLecture = getRandomChoice(
        await this.prisma.session_userprofile_taken_lectures.findMany({
          where: {
            userprofile_id: userId,
          },
        }),
      );
      if (!takenLecture) {
        return null;
      }

      feed = await this.prisma.main_reviewwritedailyuserfeed.create({
        include: reviewWriteDailyUserFeed_details.include,
        data: {
          date,
          priority: Math.random(),
          visible: Math.random() < 0.6,
          user_id: userId,
          lecture_id: takenLecture.id,
        },
      });
    }

    return feed;
  }

  public async getOrCreateRelatedCourseDailyUserFeed(
    date: Date,
    userId: number,
  ): Promise<main_relatedcoursedailyuserfeed | null> {
    let feed = await this.prisma.main_relatedcoursedailyuserfeed.findFirst({
      include: relatedCourseDailyUserFeed_details.include,
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
        include: relatedCourseDailyUserFeed_details.include,
        data: {
          date,
          priority: Math.random(),
          visible: Math.random() < 0.45,
          course_id: takenLecture.lecture.course_id,
          user_id: userId,
        },
      });
    }

    return feed;
  }

  public async getOrCreateRateDailyUserFeed(
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
      beforeDate.setDate(date.getDate() - 3);
      const afterDate = new Date(date);
      afterDate.setDate(date.getDate() + 3);
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
          visible: Math.random() < 0.25,
          user_id: userId,
        },
      });
    }

    return feed;
  }

  // public async getUserFeeds(
  //   date: Date,
  //   user: session_userprofile,
  //   subject_department: subject_department,
  // ) {
  //   const relatedCourseDailyUserFeeds =
  //     await this.prisma.main_relatedcoursedailyuserfeed.findMany();
  //   const rateDailyUserFeeds =
  //     await this.prisma.main_ratedailyuserfeed.findMany();
  //   review_write_daily_user_feed = ReviewWriteDailyUserFeed.get(date=date, user=userprofile)
  //   related_course_daily_user_feed = RelatedCourseDailyUserFeed.get(date=date, user=userprofile)
  //   rate_daily_user_feed = RateDailyUserFeed.get(date=date, user=userprofile)
  // }
}