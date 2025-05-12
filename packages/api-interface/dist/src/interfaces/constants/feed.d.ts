import { Union } from '@otl/api-interface/src/interfaces/utils/util';
export declare const FeedType: {
  FamousHumanityReview: string;
  FamousMajorReview: string;
  ReviewWrite: string;
  RelatedCourse: string;
  RankedReview: string;
  Rate: string;
};
export type FeedType = Union<typeof FeedType>;
export declare const FeedVisibleRate: {
  FamousHumanityReview: number;
  FamousMajorReview: number;
  ReviewWrite: number;
  RelatedCourse: number;
  RankedReview: number;
  Rate: number;
};
export type FeedVisibleRate = Union<typeof FeedVisibleRate>;
export declare const FeedRateMinDays = 3;
