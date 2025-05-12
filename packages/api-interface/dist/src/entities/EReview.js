'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.EReview = void 0;
const client_1 = require('@prisma/client');
const ECourse_1 = require('@otl/api-interface/src/entities/ECourse');
const ELecture_1 = require('@otl/api-interface/src/entities/ELecture');
var EReview;
(function (EReview) {
  EReview.Basic = client_1.Prisma.validator()({});
  EReview.Details = client_1.Prisma.validator()({
    include: {
      course: ECourse_1.ECourse.Details,
      lecture: ELecture_1.ELecture.Details,
      review_reviewvote: true,
    },
  });
  EReview.WithLectures = client_1.Prisma.validator()({
    include: {
      lecture: ELecture_1.ELecture.Basic,
    },
  });
  let EReviewVote;
  (function (EReviewVote) {
    EReviewVote.Basic = client_1.Prisma.validator()({});
  })((EReviewVote = EReview.EReviewVote || (EReview.EReviewVote = {})));
})(EReview || (exports.EReview = EReview = {}));
//# sourceMappingURL=EReview.js.map
