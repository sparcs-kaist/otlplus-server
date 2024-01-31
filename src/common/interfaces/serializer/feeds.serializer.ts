import {
  FamousHumanityReviewDailyFeed_details,
  RankedReviewDailyFeed_details,
  isFamousHumanityReviewDailyFeed,
} from 'src/common/schemaTypes/feeds';
import { IFeed } from '../dto/feeds/IFeed';
import { toJsonReview } from './review.serializer';

export const toJsonFeed = (
  feed: FamousHumanityReviewDailyFeed_details | RankedReviewDailyFeed_details,
): IFeed.ICommon => {
  if (isFamousHumanityReviewDailyFeed(feed)) {
    return {
      type: 'FAMOUS_HUMANITY_REVIEW',
      date: feed.date,
      priority: feed.priority,
      reviews: feed.main_famoushumanityreviewdailyfeed_reviews.map(
        (feedReview) => toJsonReview(feedReview.review_review),
      ),
    };
  }
  return {
    type: 'RANKED_REVIEW',
    date: feed.date,
    priority: feed.priority,
    reviews: feed.reviews.map((review) => toJsonReview(review)),
  };
};
