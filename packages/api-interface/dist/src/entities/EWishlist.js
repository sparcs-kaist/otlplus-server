'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.EWishlist = void 0;
const client_1 = require('@prisma/client');
const ELecture_1 = require('@otl/api-interface/src/entities/ELecture');
var EWishlist;
(function (EWishlist) {
  EWishlist.WithLectures = client_1.Prisma.validator()({
    include: {
      timetable_wishlist_lectures: {
        include: {
          subject_lecture: {
            include: ELecture_1.ELecture.Details.include,
          },
        },
        where: { subject_lecture: { deleted: false } },
      },
    },
  });
})(EWishlist || (exports.EWishlist = EWishlist = {}));
//# sourceMappingURL=EWishlist.js.map
