'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ECourse = void 0;
const client_1 = require('@prisma/client');
var ECourse;
(function (ECourse) {
  ECourse.Basic = client_1.Prisma.validator()({});
  ECourse.Extended = client_1.Prisma.validator()({
    include: {
      subject_department: true,
      subject_course_professors: { include: { professor: true } },
    },
  });
  ECourse.Details = client_1.Prisma.validator()({
    include: {
      ...ECourse.Extended.include,
      lecture: true,
    },
  });
  ECourse.DetailWithIsRead = client_1.Prisma.validator()({
    include: {
      ...ECourse.Details.include,
      subject_courseuser: true,
    },
  });
  let ECourseUser;
  (function (ECourseUser) {
    ECourseUser.Basic = client_1.Prisma.validator()({});
  })((ECourseUser = ECourse.ECourseUser || (ECourse.ECourseUser = {})));
})(ECourse || (exports.ECourse = ECourse = {}));
//# sourceMappingURL=ECourse.js.map
