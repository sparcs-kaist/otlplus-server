import { Prisma } from '@prisma/client';
import {
  ReviewDetails,
  courseDetails,
  lectureDetails,
  reviewDetails,
} from '../schemaTypes/types';

export namespace EFeed {
  export const EFamousHumanityReviewDetails =
    Prisma.validator<Prisma.main_famoushumanityreviewdailyfeedArgs>()({
      include: {
        main_famoushumanityreviewdailyfeed_reviews: {
          include: { review_review: { include: reviewDetails.include } },
        },
      },
    });

  export const ERankedReviewDetails =
    Prisma.validator<Prisma.main_rankedreviewdailyfeedArgs>()({});

  export const EFamousMajorReviewDetails =
    Prisma.validator<Prisma.main_famousmajorreviewdailyfeedArgs>()({
      include: {
        subject_department: true,
        main_famousmajorreviewdailyfeed_reviews: {
          include: { review_review: { include: reviewDetails.include } },
        },
      },
    });

  export const EReviewWriteDetails =
    Prisma.validator<Prisma.main_reviewwritedailyuserfeedArgs>()({
      include: {
        subject_lecture: {
          include: lectureDetails.include,
        },
      },
    });

  export const ERelatedCourseDetails =
    Prisma.validator<Prisma.main_relatedcoursedailyuserfeedArgs>()({
      include: {
        subject_course: {
          include: courseDetails.include,
        },
      },
    });

  export const ERateDailyDetails =
    Prisma.validator<Prisma.main_ratedailyuserfeedArgs>()({});

  export type EFamousHumanityReviewDetails =
    Prisma.main_famoushumanityreviewdailyfeedGetPayload<
      typeof EFamousHumanityReviewDetails
    >;

  export type ERankedReviewDetails =
    Prisma.main_rankedreviewdailyfeedGetPayload<typeof ERankedReviewDetails> & {
      reviews: ReviewDetails[];
    };

  export type EFamousMajorReviewDetails =
    Prisma.main_famousmajorreviewdailyfeedGetPayload<
      typeof EFamousMajorReviewDetails
    >;

  export type EReviewWriteDetails =
    Prisma.main_reviewwritedailyuserfeedGetPayload<typeof EReviewWriteDetails>;

  export type ERelatedCourseDetails =
    Prisma.main_relatedcoursedailyuserfeedGetPayload<
      typeof ERelatedCourseDetails
    >;

  export type ERateDailyDetails = Prisma.main_ratedailyuserfeedGetPayload<
    typeof ERateDailyDetails
  >;

  export type EDetails =
    | EFamousHumanityReviewDetails
    | ERankedReviewDetails
    | EFamousMajorReviewDetails
    | EReviewWriteDetails
    | ERelatedCourseDetails
    | ERateDailyDetails;

  export const isFamousHumanityReview = (
    feed: EDetails,
  ): feed is EFamousHumanityReviewDetails => {
    return 'main_famoushumanityreviewdailyfeed_reviews' in feed;
  };

  export const isFamousMajorReview = (
    feed: EDetails,
  ): feed is EFamousMajorReviewDetails => {
    return 'main_famousmajorreviewdailyfeed_reviews' in feed;
  };

  export const isReviewWrite = (
    feed: EDetails,
  ): feed is EReviewWriteDetails => {
    return 'subject_lecture' in feed;
  };

  export const isRelatedCourse = (
    feed: EDetails,
  ): feed is ERelatedCourseDetails => {
    return 'subject_course' in feed;
  };

  export const isRankedReview = (
    feed: EDetails,
  ): feed is ERankedReviewDetails => {
    return 'semester_id' in feed;
  };
}
