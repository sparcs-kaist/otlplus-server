import { Injectable } from '@nestjs/common';
import { review_humanitybestreview, subject_department } from '@prisma/client';
import { reviewDetails } from 'src/common/schemaTypes/types';
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
        include: {
          main_famoushumanityreviewdailyfeed_reviews: {
            include: { review_review: { include: reviewDetails.include } },
          },
        },
      });

    if (!famousHumanityReviewDailyFeed) {
      // Prisma does not support RAND() in ORDER BY.
      const humanityBestReviews = (await this.prisma.$queryRaw`
        SELECT * FROM review_humanitybestreview 
        ORDER BY RAND() 
        LIMIT 3`) satisfies review_humanitybestreview;

      famousHumanityReviewDailyFeed =
        await this.prisma.main_famoushumanityreviewdailyfeed.create({
          include: {
            main_famoushumanityreviewdailyfeed_reviews: {
              include: { review_review: { include: reviewDetails.include } },
            },
          },
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

  public async getOrCreateRankedReviewDailyFeeds(date: Date) {
    const rankedReviewDailyFeeds =
      await this.prisma.main_rankedreviewdailyfeed.findMany({
        where: {
          date,
          visible: true,
        },
      });

    return rankedReviewDailyFeeds;
  }

  public async getOrCreateFamousMajorReviewDailyFeeds(
    date: Date,
    subject_department: subject_department,
  ) {
    const famousMajorReviewDailyFeeds =
      await this.prisma.main_famousmajorreviewdailyfeed.findMany({
        where: {
          date,
          subject_department,
        },
      });

    return famousMajorReviewDailyFeeds;
  }

  // public async getOrCreateReviewWriteDailyUserFeeds() {
  //   const reviewWriteDailyUserFeeds =
  //     await this.prisma.main_reviewwritedailyuserfeed.findMany();

  //   return reviewWriteDailyUserFeeds;
  // }

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
