import { Injectable } from '@nestjs/common';
import { session_userprofile } from '@prisma/client';
import { EFeed } from 'src/common/entites/EFeed';
import { IFeed } from 'src/common/interfaces/IFeed';
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

  private filterFeeds(feeds: EFeed.Details[], feed: EFeed.Details | null) {
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
    const feeds: EFeed.Details[] = [];

    const famousHumanityReview =
      await this.feedsRepository.getOrCreateFamousHumanityReview(date);
    this.filterFeeds(feeds, famousHumanityReview);

    /**
     * "RANKED_REVIEW" does not require RankedReview
     * Always shows TOP 3 liked reviews.
     */
    const rankedReview = await this.feedsRepository.getOrCreateRankedReview(
      date,
    );
    const top3LikedReviews = await this.reviewsRepository.getTopLikedReviews(3);

    /**
     * RankedReview schema dose not have relation with review_review.
     * So, manually add reviews in app level.
     */
    const rankedReviewWithReviews = {
      ...rankedReview,
      ...{ reviews: top3LikedReviews },
    };
    this.filterFeeds(feeds, rankedReviewWithReviews);

    const famousMajorReviews = await Promise.all(
      departments.map(async (department) => {
        return this.feedsRepository.getOrCreateFamousMajorReview(
          date,
          department,
        );
      }),
    );
    famousMajorReviews.forEach((feed) => {
      this.filterFeeds(feeds, feed);
    });

    const reviewWrite = await this.feedsRepository.getOrCreateReviewWrite(
      date,
      user.id,
    );
    this.filterFeeds(feeds, reviewWrite);

    /**
     * @NOTE
     * RelatedCourse does not have Datas of posterior or prior courses.
     * Comment out below until having enough Datas.
     */
    // const relatedCourse = await this.feedsRepository.getOrCreateRelatedCourse(
    //   date,
    //   user.id,
    // );
    // this.filterFeeds(feeds, relatedCourse);

    const rateDaily = await this.feedsRepository.getOrCreateRate(date, user.id);
    this.filterFeeds(feeds, rateDaily);

    return feeds;
  }
}
