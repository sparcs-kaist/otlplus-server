import {
  FamousHumanityReviewDailyFeed_details,
  FamousMajorReviewDailyFeed_Details,
  RankedReviewDailyFeed_details,
  isFamousHumanityReviewDailyFeed,
  isFamousMajorReviewDailyFeed,
} from 'src/common/schemaTypes/feeds';
import { IFeed } from '../dto/feeds/IFeed';
import { toJsonDepartment } from './department.serializer';
import { toJsonReview } from './review.serializer';

export const toJsonFeed = (
  feed:
    | FamousHumanityReviewDailyFeed_details
    | RankedReviewDailyFeed_details
    | FamousMajorReviewDailyFeed_Details,
): IFeed.IBasic => {
  if (isFamousHumanityReviewDailyFeed(feed)) {
    return {
      type: 'FAMOUS_HUMANITY_REVIEW',
      date: feed.date,
      priority: feed.priority,
      reviews: feed.main_famoushumanityreviewdailyfeed_reviews.map(
        (feedReview) => toJsonReview(feedReview.review_review),
      ),
    };
  } else if (isFamousMajorReviewDailyFeed(feed)) {
    return {
      type: 'FAMOUS_MAJOR_REVIEW',
      date: feed.date,
      priority: feed.priority,
      reviews: feed.main_famousmajorreviewdailyfeed_reviews.map((feedReview) =>
        toJsonReview(feedReview.review_review),
      ),
      department: toJsonDepartment(feed.subject_department),
    };
  }

  return {
    type: 'RANKED_REVIEW',
    date: feed.date,
    priority: feed.priority,
    reviews: feed.reviews.map((review) => toJsonReview(review)),
  };
};
