'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.EPersonal = void 0;
const client_1 = require('@prisma/client');
var EPersonal;
(function (EPersonal) {
  EPersonal.Basic = client_1.Prisma.validator()({
    include: {
      personal_timeblocks: true,
    },
  });
})(EPersonal || (exports.EPersonal = EPersonal = {}));
//# sourceMappingURL=EPersonal.js.map
