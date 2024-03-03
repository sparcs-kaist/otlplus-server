import { Injectable } from '@nestjs/common';
import { session_userprofile, subject_department } from '@prisma/client';
import { EFeed } from 'src/common/entities/EFeed';
import { IFeed } from 'src/common/interfaces/IFeed';
import { getRandomChoice } from 'src/common/utils/method.utils';
import { DepartmentRepository } from 'src/prisma/repositories/department.repository';
import { FeedsRepository } from 'src/prisma/repositories/feeds.repository';
import { ReviewsRepository } from 'src/prisma/repositories/review.repository';
import { UserRepository } from 'src/prisma/repositories/user.repository';

@Injectable()
export class FeedsService {
  constructor(
    private readonly departmentRepository: DepartmentRepository,
    private readonly feedsRepository: FeedsRepository,
    private readonly reviewsRepository: ReviewsRepository,
    private readonly userRepository: UserRepository,
  ) {}

  private filterFeeds(feeds: EFeed.Details[], feed: EFeed.Details | null) {
    if (feed && feed.visible) {
      feeds.push(feed);
    }
  }

  private async getFamousHumanityReview(date: Date) {
    let feed = await this.feedsRepository.getFamousHumanityReview(date);
    if (!feed) {
      const humanityBestReviews =
        await this.reviewsRepository.getRandomNHumanityBestReviews(3);

      feed = await this.feedsRepository.createFamousHumanityReview(
        date,
        humanityBestReviews,
      );
    }

    return feed;
  }

  private async getRankedReview(date: Date) {
    let feed = await this.feedsRepository.getRankedReview(date);

    if (!feed) {
      feed = await this.feedsRepository.createRankedReview(date);
    }
    return feed;
  }

  private async getFamousMajorReviews(
    date: Date,
    departments: subject_department[],
  ) {
    return await Promise.all(
      departments.map(async (department) => {
        let feed = await this.feedsRepository.getFamousMajorReview(
          date,
          department,
        );

        if (!feed) {
          const majorBestReviews =
            await this.reviewsRepository.getRandomNMajorBestReviews(
              3,
              department,
            );

          feed = await this.feedsRepository.createFamousMajorReview(
            date,
            department,
            majorBestReviews,
          );
        }

        return feed;
      }),
    );
  }

  private async getReviewWrite(date: Date, userId: number) {
    let feed = await this.feedsRepository.getReviewWrite(date, userId);

    if (!feed) {
      const takenLecture = getRandomChoice(
        await this.userRepository.getReviewWritableTakenLectures(userId),
      );

      feed = await this.feedsRepository.createReviewWrite(
        date,
        userId,
        takenLecture.lecture_id,
      );
    }

    return feed;
  }

  public async getFeeds(query: IFeed.QueryDto, user: session_userprofile) {
    const { date: dateString } = query;
    const date = new Date(dateString);
    const departments = await this.departmentRepository.getRelatedDepartments(
      user,
    );
    const feeds: EFeed.Details[] = [];

    const famousHumanityReview = await this.getFamousHumanityReview(date);
    this.filterFeeds(feeds, famousHumanityReview);

    /**
     * "RANKED_REVIEW" does not require RankedReview
     * Always shows TOP 3 liked reviews.
     */
    const rankedReview = await this.getRankedReview(date);
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

    const famousMajorReviews = await this.getFamousMajorReviews(
      date,
      departments,
    );
    famousMajorReviews.forEach((feed) => {
      this.filterFeeds(feeds, feed);
    });

    const reviewWrite = await this.getReviewWrite(date, user.id);
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
