import { Injectable } from '@nestjs/common';
import {
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
    let famousHumanityReviewDailyFeed =
      await this.prisma.main_famoushumanityreviewdailyfeed.findFirst({
        where: {
          date,
        },
        include: famousHumanityReviewDailyFeed_details.include,
      });

    if (!famousHumanityReviewDailyFeed) {
      // Prisma does not support RAND() in ORDER BY.
      const humanityBestReviews = (await this.prisma.$queryRaw`
        SELECT * FROM review_humanitybestreview 
        ORDER BY RAND() 
        LIMIT 3`) satisfies review_humanitybestreview;

      famousHumanityReviewDailyFeed =
        await this.prisma.main_famoushumanityreviewdailyfeed.create({
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

    return famousHumanityReviewDailyFeed;
  }

  public async getOrCreateRankedReviewDailyFeed(date: Date) {
    let rankedReviewDailyFeed =
      await this.prisma.main_rankedreviewdailyfeed.findFirst({
        where: {
          date,
        },
      });

    if (!rankedReviewDailyFeed) {
      rankedReviewDailyFeed =
        await this.prisma.main_rankedreviewdailyfeed.create({
          data: {
            date,
            priority: Math.random(),
            visible: Math.random() < 0.15,
          },
        });
    }

    return rankedReviewDailyFeed;
  }

  public async getOrCreateFamousMajorReviewDailyFeeds(
    date: Date,
    subject_department: subject_department,
  ) {
    let famousMajorReviewDailyFeed =
      await this.prisma.main_famousmajorreviewdailyfeed.findFirst({
        include: famousMajorReviewDailyFeed_Details.include,
        where: {
          date,
          subject_department,
        },
      });

    if (!famousMajorReviewDailyFeed) {
      // Prisma does not support RAND() in ORDER BY.
      const majorBestReviews = (await this.prisma.$queryRaw`
        SELECT mbr.* FROM review_majorbestreview mbr
        INNER JOIN review_review r ON r.id = mbr.review_id
        INNER JOIN subject_lecture l ON l.id = r.lecture_id
        INNER JOIN subject_department d on d.id = l.department_id
        WHERE d.id = ${subject_department.id}
        ORDER BY RAND() 
        LIMIT 3`) satisfies review_majorbestreview;

      famousMajorReviewDailyFeed =
        await this.prisma.main_famousmajorreviewdailyfeed.create({
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

    return famousMajorReviewDailyFeed;
  }

  public async getOrCreateReviewWriteDailyUserFeeds(
    date: Date,
    userId: number,
  ): Promise<main_reviewwritedailyuserfeed | null> {
    let reviewWriteDailyUserFeed =
      await this.prisma.main_reviewwritedailyuserfeed.findFirst({
        include: reviewWriteDailyUserFeed_details.include,
        where: {
          date,
          user_id: userId,
        },
      });

    if (!reviewWriteDailyUserFeed) {
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

      reviewWriteDailyUserFeed =
        await this.prisma.main_reviewwritedailyuserfeed.create({
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

    return reviewWriteDailyUserFeed;
  }

  public async getOrCreateRelatedCourseDailyUserFeed(
    date: Date,
    userId: number,
  ): Promise<main_relatedcoursedailyuserfeed | null> {
    let relatedCourseDailyUserFeed =
      await this.prisma.main_relatedcoursedailyuserfeed.findFirst({
        include: relatedCourseDailyUserFeed_details.include,
        where: {
          date,
          user_id: userId,
        },
      });

    if (!relatedCourseDailyUserFeed) {
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

      relatedCourseDailyUserFeed =
        await this.prisma.main_relatedcoursedailyuserfeed.create({
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

    return relatedCourseDailyUserFeed;
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
