'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.EPlanners = void 0;
const client_1 = require('@prisma/client');
const ECourse_1 = require('@otl/api-interface/src/entities/ECourse');
const ELecture_1 = require('@otl/api-interface/src/entities/ELecture');
const ETrack_1 = require('@otl/api-interface/src/entities/ETrack');
var EPlanners;
(function (EPlanners) {
  let EItems;
  (function (EItems) {
    let Future;
    (function (Future) {
      Future.Basic = client_1.Prisma.validator()({});
      Future.Extended = client_1.Prisma.validator()({
        include: {
          subject_course: ECourse_1.ECourse.Details,
        },
      });
      Future.Details = client_1.Prisma.validator()({
        include: {
          ...Future.Extended.include,
          planner_planner: true,
        },
      });
    })((Future = EItems.Future || (EItems.Future = {})));
    let Taken;
    (function (Taken) {
      Taken.Basic = client_1.Prisma.validator()({});
      Taken.Extended = client_1.Prisma.validator()({
        include: {
          subject_lecture: ELecture_1.ELecture.Details,
        },
      });
      Taken.Details = client_1.Prisma.validator()({
        include: {
          subject_lecture: {
            include: {
              ...ELecture_1.ELecture.Details.include,
              course: ECourse_1.ECourse.Details,
            },
          },
        },
      });
    })((Taken = EItems.Taken || (EItems.Taken = {})));
    let Arbitrary;
    (function (Arbitrary) {
      Arbitrary.CreateInput = client_1.Prisma.validator()({});
      Arbitrary.Basic = client_1.Prisma.validator()({});
      Arbitrary.Extended = client_1.Prisma.validator()({
        include: {
          subject_department: true,
        },
      });
      Arbitrary.Details = client_1.Prisma.validator()({
        include: {
          subject_department: true,
          planner_planner: true,
        },
      });
    })((Arbitrary = EItems.Arbitrary || (EItems.Arbitrary = {})));
  })((EItems = EPlanners.EItems || (EPlanners.EItems = {})));
  EPlanners.Basic = client_1.Prisma.validator()({});
  EPlanners.Details = client_1.Prisma.validator()({
    include: {
      planner_planner_additional_tracks: {
        include: {
          graduation_additionaltrack: ETrack_1.ETrack.Additional,
        },
      },
      graduation_generaltrack: true,
      graduation_majortrack: ETrack_1.ETrack.Major,
      planner_takenplanneritem: EPlanners.EItems.Taken.Details,
      planner_arbitraryplanneritem: EPlanners.EItems.Arbitrary.Extended,
      planner_futureplanneritem: EPlanners.EItems.Future.Extended,
    },
  });
})(EPlanners || (exports.EPlanners = EPlanners = {}));
//# sourceMappingURL=EPlanners.js.map
