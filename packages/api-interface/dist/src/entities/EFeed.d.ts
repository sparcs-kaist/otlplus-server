import { Prisma } from '@prisma/client';
import { EReview } from '@otl/api-interface/src/entities/EReview';
export declare namespace EFeed {
  const FamousHumanityReviewDetails: {
    include: {
      main_famoushumanityreviewdailyfeed_reviews: {
        include: {
          review_review: {
            include: {
              course: {
                include: {
                  lecture: true;
                  subject_department: true;
                  subject_course_professors: {
                    include: {
                      professor: true;
                    };
                  };
                };
              };
              lecture: {
                include: {
                  subject_department: true;
                  subject_lecture_professors: {
                    include: {
                      professor: true;
                    };
                  };
                  subject_classtime: true;
                  subject_examtime: true;
                };
              };
              review_reviewvote: true;
            };
          };
        };
      };
    };
  };
  const RankedReviewDetails: {};
  const FamousMajorReviewDetails: {
    include: {
      subject_department: true;
      main_famousmajorreviewdailyfeed_reviews: {
        include: {
          review_review: {
            include: {
              course: {
                include: {
                  lecture: true;
                  subject_department: true;
                  subject_course_professors: {
                    include: {
                      professor: true;
                    };
                  };
                };
              };
              lecture: {
                include: {
                  subject_department: true;
                  subject_lecture_professors: {
                    include: {
                      professor: true;
                    };
                  };
                  subject_classtime: true;
                  subject_examtime: true;
                };
              };
              review_reviewvote: true;
            };
          };
        };
      };
    };
  };
  const ReviewWriteDetails: {
    include: {
      subject_lecture: {
        include: {
          subject_department: true;
          subject_lecture_professors: {
            include: {
              professor: true;
            };
          };
          subject_classtime: true;
          subject_examtime: true;
        };
      };
    };
  };
  const RelatedCourseDetails: {
    include: {
      subject_course: {
        include: {
          lecture: true;
          subject_department: true;
          subject_course_professors: {
            include: {
              professor: true;
            };
          };
        };
      };
    };
  };
  const RateDailyDetails: {};
  type FamousHumanityReviewDetails = Prisma.main_famoushumanityreviewdailyfeedGetPayload<
    typeof FamousHumanityReviewDetails
  >;
  type RankedReviewDetails = Prisma.main_rankedreviewdailyfeedGetPayload<typeof RankedReviewDetails> & {
    reviews: EReview.Details[];
  };
  type FamousMajorReviewDetails = Prisma.main_famousmajorreviewdailyfeedGetPayload<typeof FamousMajorReviewDetails>;
  type ReviewWriteDetails = Prisma.main_reviewwritedailyuserfeedGetPayload<typeof ReviewWriteDetails>;
  type RelatedCourseDetails = Prisma.main_relatedcoursedailyuserfeedGetPayload<typeof RelatedCourseDetails>;
  type RateDailyDetails = Prisma.main_ratedailyuserfeedGetPayload<typeof RateDailyDetails>;
  type Details =
    | FamousHumanityReviewDetails
    | RankedReviewDetails
    | FamousMajorReviewDetails
    | ReviewWriteDetails
    | RelatedCourseDetails
    | RateDailyDetails;
  const isFamousHumanityReview: (feed: Details) => feed is FamousHumanityReviewDetails;
  const isFamousMajorReview: (feed: Details) => feed is FamousMajorReviewDetails;
  const isReviewWrite: (feed: Details) => feed is ReviewWriteDetails;
  const isRelatedCourse: (feed: Details) => feed is RelatedCourseDetails;
  const isRankedReview: (feed: Details) => feed is RankedReviewDetails;
}
