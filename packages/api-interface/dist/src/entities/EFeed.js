'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.EFeed = void 0;
const client_1 = require('@prisma/client');
const EReview_1 = require('@otl/api-interface/src/entities/EReview');
const ELecture_1 = require('@otl/api-interface/src/entities/ELecture');
const ECourse_1 = require('@otl/api-interface/src/entities/ECourse');
var EFeed;
(function (EFeed) {
  EFeed.FamousHumanityReviewDetails = client_1.Prisma.validator()({
    include: {
      main_famoushumanityreviewdailyfeed_reviews: {
        include: { review_review: { include: EReview_1.EReview.Details.include } },
      },
    },
  });
  EFeed.RankedReviewDetails = client_1.Prisma.validator()({});
  EFeed.FamousMajorReviewDetails = client_1.Prisma.validator()({
    include: {
      subject_department: true,
      main_famousmajorreviewdailyfeed_reviews: {
        include: { review_review: { include: EReview_1.EReview.Details.include } },
      },
    },
  });
  EFeed.ReviewWriteDetails = client_1.Prisma.validator()({
    include: {
      subject_lecture: {
        include: ELecture_1.ELecture.Details.include,
      },
    },
  });
  EFeed.RelatedCourseDetails = client_1.Prisma.validator()({
    include: {
      subject_course: {
        include: ECourse_1.ECourse.Details.include,
      },
    },
  });
  EFeed.RateDailyDetails = client_1.Prisma.validator()({});
  EFeed.isFamousHumanityReview = (feed) => {
    return 'main_famoushumanityreviewdailyfeed_reviews' in feed;
  };
  EFeed.isFamousMajorReview = (feed) => {
    return 'main_famousmajorreviewdailyfeed_reviews' in feed;
  };
  EFeed.isReviewWrite = (feed) => {
    return 'subject_lecture' in feed;
  };
  EFeed.isRelatedCourse = (feed) => {
    return 'subject_course' in feed;
  };
  EFeed.isRankedReview = (feed) => {
    return 'semester_id' in feed;
  };
})(EFeed || (exports.EFeed = EFeed = {}));
//# sourceMappingURL=EFeed.js.map
