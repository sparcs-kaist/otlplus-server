'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.EUserProfile = void 0;
const client_1 = require('@prisma/client');
const ETakenLecture_1 = require('@otl/api-interface/src/entities/ETakenLecture');
var EUserProfile;
(function (EUserProfile) {
  EUserProfile.WithTakenLectures = client_1.Prisma.validator()({
    include: { taken_lectures: ETakenLecture_1.ETakenLecture.Basic },
  });
})(EUserProfile || (exports.EUserProfile = EUserProfile = {}));
//# sourceMappingURL=EUserProfile.js.map
