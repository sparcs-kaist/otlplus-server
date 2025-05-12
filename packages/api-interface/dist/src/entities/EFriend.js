'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.EFriend = void 0;
const client_1 = require('@prisma/client');
var EFriend;
(function (EFriend) {
  EFriend.Basic = client_1.Prisma.validator()({
    include: {
      friend: true,
    },
  });
  EFriend.WithLecture = client_1.Prisma.validator()({
    include: {
      friend: {
        include: {
          taken_lectures: true,
        },
      },
    },
  });
  EFriend.WithLectureProfessor = client_1.Prisma.validator()({
    include: {
      friend: {
        include: {
          taken_lectures: {
            include: {
              lecture: {
                include: {
                  subject_lecture_professors: true,
                },
              },
            },
          },
        },
      },
    },
  });
  EFriend.WithCourse = client_1.Prisma.validator()({
    include: {
      friend: {
        include: {
          taken_lectures: {
            include: {
              lecture: true,
            },
          },
        },
      },
    },
  });
})(EFriend || (exports.EFriend = EFriend = {}));
//# sourceMappingURL=EFriend.js.map
