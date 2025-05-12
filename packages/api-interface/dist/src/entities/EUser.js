'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.EUser = void 0;
const client_1 = require('@prisma/client');
var EUser;
(function (EUser) {
  EUser.Basic = client_1.Prisma.validator()({});
  EUser.WithMajors = client_1.Prisma.validator()({
    include: {
      session_userprofile_majors: true,
    },
  });
  EUser.WithMinors = client_1.Prisma.validator()({
    include: {
      session_userprofile_minors: true,
    },
  });
})(EUser || (exports.EUser = EUser = {}));
//# sourceMappingURL=EUser.js.map
