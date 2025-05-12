'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.EMeeting = void 0;
const client_1 = require('@prisma/client');
var EMeeting;
(function (EMeeting) {
  EMeeting.Group = client_1.Prisma.validator()({
    include: {
      days: true,
      members: true,
    },
  });
})(EMeeting || (exports.EMeeting = EMeeting = {}));
//# sourceMappingURL=EMeeting.js.map
