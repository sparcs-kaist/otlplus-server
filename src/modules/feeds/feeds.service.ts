import { Injectable } from '@nestjs/common';
import { session_userprofile } from '@prisma/client';
import { IFeed } from 'src/common/interfaces/dto/feeds/IFeed';
import { DepartmentRepository } from 'src/prisma/repositories/department.repository';
import { FeedsRepository } from 'src/prisma/repositories/feeds.repository';
import { ReviewsRepository } from 'src/prisma/repositories/review.repository';

@Injectable()
export class FeedsService {
  constructor(
    private readonly departmentRepository: DepartmentRepository,
    private readonly feedsRepository: FeedsRepository,
    private readonly reviewsRepository: ReviewsRepository,
  ) {}

  private filterFeeds(feeds: any, feed: any) {
    if (feed && feed.visible) {
      feeds.push(feed);
    }
  }

  public async getFeeds(query: IFeed.QueryDto, user: session_userprofile) {
    const { date: dateString } = query;
    const date = new Date(dateString);
    const departments = await this.departmentRepository.getRelatedDepartments(
      user,
    );
    const feeds: any[] = [];

    const famousHumanityReviewDailyFeed =
      await this.feedsRepository.getOrCreateFamousHumanityReviewDailyFeed(date);
    this.filterFeeds(feeds, famousHumanityReviewDailyFeed);

    /**
     * "RANKED_REVIEW" does not require RankedReviewDailyFeed
     * Always shows TOP 3 liked reviews.
     */
    const rankedReviewDailyFeed =
      await this.feedsRepository.getOrCreateRankedReviewDailyFeed(date);
    const top3LikedReviews = await this.reviewsRepository.getTopLikedReviews(3);

    const rankedReviewDailyFeedWithReviews = {
      ...rankedReviewDailyFeed,
      ...{ reviews: top3LikedReviews },
    };
    this.filterFeeds(feeds, rankedReviewDailyFeedWithReviews);

    const famousMajorReviewDailyFeeds = await Promise.all(
      departments.map(async (department) => {
        return this.feedsRepository.getOrCreateFamousMajorReviewDailyFeeds(
          date,
          department,
        );
      }),
    );
    famousMajorReviewDailyFeeds.forEach((feed) => {
      this.filterFeeds(feeds, feed);
    });

    const reviewWriteDailyUserFeed =
      await this.feedsRepository.getOrCreateReviewWriteDailyUserFeeds(
        date,
        user.id,
      );
    this.filterFeeds(feeds, reviewWriteDailyUserFeed);

    const relatedCourseDailyUserFeed =
      await this.feedsRepository.getOrCreateRelatedCourseDailyUserFeed(
        date,
        user.id,
      );
    this.filterFeeds(feeds, relatedCourseDailyUserFeed);

    return feeds;
  }
}
