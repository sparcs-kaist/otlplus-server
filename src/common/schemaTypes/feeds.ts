import { Prisma } from '@prisma/client';
import {
  ReviewDetails,
  courseDetails,
  lectureDetails,
  reviewDetails,
} from './types';

export const famousHumanityReviewDailyFeed_details =
  Prisma.validator<Prisma.main_famoushumanityreviewdailyfeedArgs>()({
    include: {
      main_famoushumanityreviewdailyfeed_reviews: {
        include: { review_review: { include: reviewDetails.include } },
      },
    },
  });

export const rankedReviewDailyFeed_details =
  Prisma.validator<Prisma.main_rankedreviewdailyfeedArgs>()({});

export const famousMajorReviewDailyFeed_Details =
  Prisma.validator<Prisma.main_famousmajorreviewdailyfeedArgs>()({
    include: {
      subject_department: true,
      main_famousmajorreviewdailyfeed_reviews: {
        include: { review_review: { include: reviewDetails.include } },
      },
    },
  });

export const reviewWriteDailyUserFeed_details =
  Prisma.validator<Prisma.main_reviewwritedailyuserfeedArgs>()({
    include: {
      subject_lecture: {
        include: lectureDetails.include,
      },
    },
  });

export const relatedCourseDailyUserFeed_details =
  Prisma.validator<Prisma.main_relatedcoursedailyuserfeedArgs>()({
    include: {
      subject_course: {
        include: courseDetails.include,
      },
    },
  });

export type FamousHumanityReviewDailyFeed_details =
  Prisma.main_famoushumanityreviewdailyfeedGetPayload<
    typeof famousHumanityReviewDailyFeed_details
  >;

export type RankedReviewDailyFeed_details =
  Prisma.main_rankedreviewdailyfeedGetPayload<
    typeof rankedReviewDailyFeed_details
  > & { reviews: ReviewDetails[] };

export type FamousMajorReviewDailyFeed_Details =
  Prisma.main_famousmajorreviewdailyfeedGetPayload<
    typeof famousMajorReviewDailyFeed_Details
  >;

export type ReviewWriteDailyUserFeed_details =
  Prisma.main_reviewwritedailyuserfeedGetPayload<
    typeof reviewWriteDailyUserFeed_details
  >;

export type RelatedCourseDailyUserFeed_details =
  Prisma.main_relatedcoursedailyuserfeedGetPayload<
    typeof relatedCourseDailyUserFeed_details
  >;

export const isFamousHumanityReviewDailyFeed = (
  feed:
    | FamousHumanityReviewDailyFeed_details
    | RankedReviewDailyFeed_details
    | FamousMajorReviewDailyFeed_Details
    | ReviewWriteDailyUserFeed_details
    | RelatedCourseDailyUserFeed_details,
): feed is FamousHumanityReviewDailyFeed_details => {
  return 'main_famoushumanityreviewdailyfeed_reviews' in feed;
};

export const isFamousMajorReviewDailyFeed = (
  feed:
    | FamousHumanityReviewDailyFeed_details
    | RankedReviewDailyFeed_details
    | FamousMajorReviewDailyFeed_Details
    | ReviewWriteDailyUserFeed_details
    | RelatedCourseDailyUserFeed_details,
): feed is FamousMajorReviewDailyFeed_Details => {
  return 'main_famousmajorreviewdailyfeed_reviews' in feed;
};

export const isReviewWriteDailyUserFeed = (
  feed:
    | FamousHumanityReviewDailyFeed_details
    | RankedReviewDailyFeed_details
    | FamousMajorReviewDailyFeed_Details
    | ReviewWriteDailyUserFeed_details
    | RelatedCourseDailyUserFeed_details,
): feed is ReviewWriteDailyUserFeed_details => {
  return 'subject_lecture' in feed;
};
