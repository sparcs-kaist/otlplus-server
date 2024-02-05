import { Prisma } from '@prisma/client';
import { ReviewDetails, reviewDetails } from './types';

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

export const isFamousHumanityReviewDailyFeed = (
  feed:
    | FamousHumanityReviewDailyFeed_details
    | RankedReviewDailyFeed_details
    | FamousMajorReviewDailyFeed_Details,
): feed is FamousHumanityReviewDailyFeed_details => {
  return 'main_famoushumanityreviewdailyfeed_reviews' in feed;
};

export const isFamousMajorReviewDailyFeed = (
  feed:
    | FamousHumanityReviewDailyFeed_details
    | RankedReviewDailyFeed_details
    | FamousMajorReviewDailyFeed_Details,
): feed is FamousMajorReviewDailyFeed_Details => {
  return 'main_famousmajorreviewdailyfeed_reviews' in feed;
};
