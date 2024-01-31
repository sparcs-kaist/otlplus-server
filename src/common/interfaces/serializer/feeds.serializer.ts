import { IFeed } from '../dto/feeds/IFeed';
import { toJsonReview } from './review.serializer';

export const toJsonFeed = (feed: any): IFeed.ICommon => {
  return {
    type: 'FAMOUS_HUMANITY_REVIEW',
    date: feed.date,
    priority: feed.priority,
    reviews: feed.main_famoushumanityreviewdailyfeed_reviews.map(
      (feedReview: any) => toJsonReview(feedReview.review_review),
    ),
  };
};
``;
