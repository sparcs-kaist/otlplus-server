import { Prisma } from '@prisma/client';
import { EReview } from './EReview';
import { ELecture } from './ELecture';
import { ECourse } from './ECourse';

export namespace EFeed {
  export const FamousHumanityReviewDetails = Prisma.validator<Prisma.main_famoushumanityreviewdailyfeedDefaultArgs>()({
    include: {
      main_famoushumanityreviewdailyfeed_reviews: {
        include: { review_review: { include: EReview.Details.include } },
      },
    },
  });

  export const RankedReviewDetails = Prisma.validator<Prisma.main_rankedreviewdailyfeedDefaultArgs>()({});

  export const FamousMajorReviewDetails = Prisma.validator<Prisma.main_famousmajorreviewdailyfeedDefaultArgs>()({
    include: {
      subject_department: true,
      main_famousmajorreviewdailyfeed_reviews: {
        include: { review_review: { include: EReview.Details.include } },
      },
    },
  });

  export const ReviewWriteDetails = Prisma.validator<Prisma.main_reviewwritedailyuserfeedDefaultArgs>()({
    include: {
      subject_lecture: {
        include: ELecture.Details.include,
      },
    },
  });

  export const RelatedCourseDetails = Prisma.validator<Prisma.main_relatedcoursedailyuserfeedDefaultArgs>()({
    include: {
      subject_course: {
        include: ECourse.Details.include,
      },
    },
  });

  export const RateDailyDetails = Prisma.validator<Prisma.main_ratedailyuserfeedDefaultArgs>()({});

  export type FamousHumanityReviewDetails = Prisma.main_famoushumanityreviewdailyfeedGetPayload<
    typeof FamousHumanityReviewDetails
  >;

  export type RankedReviewDetails = Prisma.main_rankedreviewdailyfeedGetPayload<typeof RankedReviewDetails> & {
    reviews: EReview.Details[];
  };

  export type FamousMajorReviewDetails = Prisma.main_famousmajorreviewdailyfeedGetPayload<
    typeof FamousMajorReviewDetails
  >;

  export type ReviewWriteDetails = Prisma.main_reviewwritedailyuserfeedGetPayload<typeof ReviewWriteDetails>;

  export type RelatedCourseDetails = Prisma.main_relatedcoursedailyuserfeedGetPayload<typeof RelatedCourseDetails>;

  export type RateDailyDetails = Prisma.main_ratedailyuserfeedGetPayload<typeof RateDailyDetails>;

  export type Details =
    | FamousHumanityReviewDetails
    | RankedReviewDetails
    | FamousMajorReviewDetails
    | ReviewWriteDetails
    | RelatedCourseDetails
    | RateDailyDetails;

  export const isFamousHumanityReview = (feed: Details): feed is FamousHumanityReviewDetails => {
    return 'main_famoushumanityreviewdailyfeed_reviews' in feed;
  };

  export const isFamousMajorReview = (feed: Details): feed is FamousMajorReviewDetails => {
    return 'main_famousmajorreviewdailyfeed_reviews' in feed;
  };

  export const isReviewWrite = (feed: Details): feed is ReviewWriteDetails => {
    return 'subject_lecture' in feed;
  };

  export const isRelatedCourse = (feed: Details): feed is RelatedCourseDetails => {
    return 'subject_course' in feed;
  };

  export const isRankedReview = (feed: Details): feed is RankedReviewDetails => {
    return 'semester_id' in feed;
  };
}
