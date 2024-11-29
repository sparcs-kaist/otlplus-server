import { Union } from '../../utils/method.utils';

export const FeedType = {
  FamousHumanityReview: 'FAMOUS_HUMANITY_REVIEW',
  FamousMajorReview: 'FAMOUS_MAJOR_REVIEW',
  ReviewWrite: 'REVIEW_WRITE',
  RelatedCourse: 'RELATED_COURSE',
  RankedReview: 'RANKED_REVIEW',
  Rate: 'RATE',
};
export type FeedType = Union<typeof FeedType>;

export const FeedVisibleRate = {
  FamousHumanityReview: 0.5,
  FamousMajorReview: 0.6,
  ReviewWrite: 0.6,
  RelatedCourse: 0.45,
  RankedReview: 0.15,
  Rate: 0.25,
};
export type FeedVisibleRate = Union<typeof FeedVisibleRate>;

export const FeedRateMinDays = 3;
