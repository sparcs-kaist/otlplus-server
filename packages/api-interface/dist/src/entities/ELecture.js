'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ELecture = void 0;
const client_1 = require('@prisma/client');
var ELecture;
(function (ELecture) {
  ELecture.Basic = client_1.Prisma.validator()({});
  ELecture.Extended = client_1.Prisma.validator()({
    include: {
      subject_department: true,
      subject_lecture_professors: { include: { professor: true } },
    },
  });
  ELecture.WithClasstime = client_1.Prisma.validator()({
    include: {
      subject_classtime: true,
    },
  });
  ELecture.UserTaken = client_1.Prisma.validator()({
    include: {
      subject_classtime: true,
      subject_department: true,
    },
  });
  ELecture.Details = client_1.Prisma.validator()({
    include: {
      subject_department: true,
      subject_lecture_professors: { include: { professor: true } },
      subject_classtime: true,
      subject_examtime: true,
    },
  });
  ELecture.DetailsWithCourse = client_1.Prisma.validator()({
    include: {
      ...ELecture.Details.include,
      course: true,
    },
  });
  function isDetails(lecture) {
    return 'subject_classtime' in lecture && 'subject_examtime' in lecture;
  }
  ELecture.isDetails = isDetails;
})(ELecture || (exports.ELecture = ELecture = {}));
//# sourceMappingURL=ELecture.js.map
