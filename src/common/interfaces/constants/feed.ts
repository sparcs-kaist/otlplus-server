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
