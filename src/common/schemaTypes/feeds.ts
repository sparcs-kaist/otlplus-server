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

// export const famousMajorReviewDailyFeed_Details =
//   Prisma.validator<Prisma.main_famousmajorreviewdailyfeedArgs>()({});

export type FamousHumanityReviewDailyFeed_details =
  Prisma.main_famoushumanityreviewdailyfeedGetPayload<
    typeof famousHumanityReviewDailyFeed_details
  >;

export type RankedReviewDailyFeed_details =
  Prisma.main_rankedreviewdailyfeedGetPayload<
    typeof rankedReviewDailyFeed_details
  > & { reviews: ReviewDetails[] };

// export type FamousMajorReviewDailyFeed_Details =
//   Prisma.main_famoushumanityreviewdailyfeedGetPayload<
//     typeof famousMajorReviewDailyFeed_Details
//   >;

export const isFamousHumanityReviewDailyFeed = (
  feed: FamousHumanityReviewDailyFeed_details | RankedReviewDailyFeed_details,
): feed is FamousHumanityReviewDailyFeed_details => {
  return 'main_famoushumanityreviewdailyfeed_reviews' in feed;
};
