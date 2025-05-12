'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ETrack = void 0;
const client_1 = require('@prisma/client');
var ETrack;
(function (ETrack) {
  ETrack.Major = client_1.Prisma.validator()({
    include: {
      subject_department: true,
    },
  });
  ETrack.Additional = client_1.Prisma.validator()({
    include: {
      subject_department: true,
    },
  });
})(ETrack || (exports.ETrack = ETrack = {}));
//# sourceMappingURL=ETrack.js.map
