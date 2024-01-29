import { Injectable } from '@nestjs/common';
import { session_userprofile } from '@prisma/client';
import { IFeed } from 'src/common/interfaces/dto/feeds/IFeed';
import { DepartmentRepository } from 'src/prisma/repositories/department.repository';

@Injectable()
export class FeedsService {
  constructor(private readonly departmentRepository: DepartmentRepository) {}

  async getFeeds(
    query: IFeed.QueryDto,
    user: session_userprofile,
  ): Promise<void> {
    const { date } = query;
    const departments = this.departmentRepository.getRelatedDepartments(user);

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
