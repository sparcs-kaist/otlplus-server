import { Injectable } from '@nestjs/common';
import { session_userprofile } from '@prisma/client';
import { IFeed } from 'src/common/interfaces/dto/feeds/IFeed';
import { DepartmentRepository } from 'src/prisma/repositories/department.repository';
import { FeedsRepository } from 'src/prisma/repositories/feeds.repository';

@Injectable()
export class FeedsService {
  constructor(
    private readonly departmentRepository: DepartmentRepository,
    private readonly feedsRepository: FeedsRepository,
  ) {}

  async getFeeds(query: IFeed.QueryDto, user: session_userprofile) {
    const { date: dateString } = query;
    const date = new Date(dateString);
    const departments = await this.departmentRepository.getRelatedDepartments(
      user,
    );

    const famousHumanityReviewDailyFeed =
      await this.feedsRepository.getOrCreateFamousHumanityReviewDailyFeed(date);

    // const rankedReviewDailyFeeds =
    //   await this.feedsRepository.getOrCreateRankedReviewDailyFeeds(date);

    // const famousMajorReviewDailyFeeds = await Promise.all(
    //   departments.map(async (department) => {
    //     return this.feedsRepository.getOrCreateFamousMajorReviewDailyFeeds(
    //       date,
    //       department,
    //     );
    //   }),
    // );

    return [famousHumanityReviewDailyFeed];

    //   famous_humanity_review_daily_feed = FamousHumanityReviewDailyFeed.get(date=date)

    //   ranked_review_daily_feed = RankedReviewDailyFeed.get(date=date)

    //   review_write_daily_user_feed = ReviewWriteDailyUserFeed.get(date=date, user=userprofile)

    //   related_course_daily_user_feed = RelatedCourseDailyUserFeed.get(date=date, user=userprofile)

    //   rate_daily_user_feed = RateDailyUserFeed.get(date=date, user=userprofile)

    //   feeds = (
    //       famous_major_review_daily_feed_list
    //       + [famous_humanity_review_daily_feed]
    //       + [ranked_review_daily_feed]
    //       + [review_write_daily_user_feed]
    //       + [related_course_daily_user_feed]
    //       + [rate_daily_user_feed]
    //   )
    //   feeds = [f for f in feeds if f is not None]
    //   feeds = sorted(feeds, key=(lambda f: f.priority))
    //   result = [f.to_json(user=request.user) for f in feeds]
  }
}
