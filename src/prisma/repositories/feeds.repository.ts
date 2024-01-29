import { Injectable } from '@nestjs/common';
import { session_userprofile, subject_department } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class FeedsRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async getFeeds(date: Date) {
    const famousHumanityReviewDailyFeeds =
      await this.prisma.main_famoushumanityreviewdailyfeed.findMany({
        where: {
          date,
          visible: true,
        },
        include: {
          main_famoushumanityreviewdailyfeed_reviews: {
            include: {
              review_review: true,
            },
          },
        },
        take: 3,
      });
    const rankedReviewDailyFeeds =
      await this.prisma.main_rankedreviewdailyfeed.findMany({
        where: {
          date,
          visible: true,
        },
      });

    return famousHumanityReviewDailyFeeds;
  }
  public async getUserFeeds(
    date: Date,
    user: session_userprofile,
    subject_department: subject_department,
  ) {
    const famousMajorReviewDailyFeeds =
      await this.prisma.main_famousmajorreviewdailyfeed.findMany({
        where: {
          date,
          subject_department,
        },
      });
    const reviewWriteDailyUserFeeds =
      await this.prisma.main_reviewwritedailyuserfeed.findMany();
    const relatedCourseDailyUserFeeds =
      await this.prisma.main_relatedcoursedailyuserfeed.findMany();
    const rateDailyUserFeeds =
      await this.prisma.main_ratedailyuserfeed.findMany();
    //   review_write_daily_user_feed = ReviewWriteDailyUserFeed.get(date=date, user=userprofile)
    //   related_course_daily_user_feed = RelatedCourseDailyUserFeed.get(date=date, user=userprofile)
    //   rate_daily_user_feed = RateDailyUserFeed.get(date=date, user=userprofile)
  }
}
