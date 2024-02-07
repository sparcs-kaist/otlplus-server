import { Prisma } from '@prisma/client';
import {
  ReviewDetails,
  courseDetails,
  lectureDetails,
  reviewDetails,
} from './types';

export namespace FeedSchema {
  export const FamousHumanityReview_Details =
    Prisma.validator<Prisma.main_famoushumanityreviewdailyfeedArgs>()({
      include: {
        main_famoushumanityreviewdailyfeed_reviews: {
          include: { review_review: { include: reviewDetails.include } },
        },
      },
    });

  export const RankedReview_Details =
    Prisma.validator<Prisma.main_rankedreviewdailyfeedArgs>()({});

  export const FamousMajorReview_Details =
    Prisma.validator<Prisma.main_famousmajorreviewdailyfeedArgs>()({
      include: {
        subject_department: true,
        main_famousmajorreviewdailyfeed_reviews: {
          include: { review_review: { include: reviewDetails.include } },
        },
      },
    });

  export const ReviewWrite_Details =
    Prisma.validator<Prisma.main_reviewwritedailyuserfeedArgs>()({
      include: {
        subject_lecture: {
          include: lectureDetails.include,
        },
      },
    });

  export const RelatedCourse_Details =
    Prisma.validator<Prisma.main_relatedcoursedailyuserfeedArgs>()({
      include: {
        subject_course: {
          include: courseDetails.include,
        },
      },
    });

  export const RateDaily_Details =
    Prisma.validator<Prisma.main_ratedailyuserfeedArgs>()({});

  export type FamousHumanityReview_Details =
    Prisma.main_famoushumanityreviewdailyfeedGetPayload<
      typeof FamousHumanityReview_Details
    >;

  export type RankedReview_Details =
    Prisma.main_rankedreviewdailyfeedGetPayload<typeof RankedReview_Details> & {
      reviews: ReviewDetails[];
    };

  export type FamousMajorReview_Details =
    Prisma.main_famousmajorreviewdailyfeedGetPayload<
      typeof FamousMajorReview_Details
    >;

  export type ReviewWrite_Details =
    Prisma.main_reviewwritedailyuserfeedGetPayload<typeof ReviewWrite_Details>;

  export type RelatedCourse_Details =
    Prisma.main_relatedcoursedailyuserfeedGetPayload<
      typeof RelatedCourse_Details
    >;

  export type RateDaily_Details = Prisma.main_ratedailyuserfeedGetPayload<
    typeof RateDaily_Details
  >;

  export type Details =
    | FamousHumanityReview_Details
    | RankedReview_Details
    | FamousMajorReview_Details
    | ReviewWrite_Details
    | RelatedCourse_Details
    | RateDaily_Details;

  export const isFamousHumanityReview = (
    feed: Details,
  ): feed is FamousHumanityReview_Details => {
    return 'main_famoushumanityreviewdailyfeed_reviews' in feed;
  };

  export const isFamousMajorReview = (
    feed: Details,
  ): feed is FamousMajorReview_Details => {
    return 'main_famousmajorreviewdailyfeed_reviews' in feed;
  };

  export const isReviewWrite = (feed: Details): feed is ReviewWrite_Details => {
    return 'subject_lecture' in feed;
  };

  export const isRelatedCourse = (
    feed: Details,
  ): feed is RelatedCourse_Details => {
    return 'subject_course' in feed;
  };

  export const isRankedReview = (
    feed: Details,
  ): feed is RankedReview_Details => {
    return 'semester_id' in feed;
  };

  export function getType(feed: Details): { return };
}
