'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ETimetable = void 0;
const client_1 = require('@prisma/client');
const ELecture_1 = require('@otl/api-interface/src/entities/ELecture');
var ETimetable;
(function (ETimetable) {
  ETimetable.Details = client_1.Prisma.validator()({
    include: {
      timetable_timetable_lectures: {
        include: {
          subject_lecture: ELecture_1.ELecture.Details,
        },
      },
    },
  });
  ETimetable.WithLectureClasstimes = client_1.Prisma.validator()({
    include: {
      subject_lecture: ELecture_1.ELecture.WithClasstime,
    },
  });
})(ETimetable || (exports.ETimetable = ETimetable = {}));
//# sourceMappingURL=ETimetable.js.map
