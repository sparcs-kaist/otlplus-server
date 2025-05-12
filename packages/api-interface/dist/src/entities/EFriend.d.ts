import { Prisma } from '@prisma/client';
import { EUser } from './EUser';
export declare namespace EFriend {
  const Basic: {
    include: {
      friend: true;
    };
  };
  type Basic = Prisma.friend_friendGetPayload<typeof Basic> & {
    friend: EUser.Basic;
  };
  const WithLecture: {
    include: {
      friend: {
        include: {
          taken_lectures: true;
        };
      };
    };
  };
  type WithLecture = Prisma.friend_friendGetPayload<typeof WithLecture>;
  const WithLectureProfessor: {
    include: {
      friend: {
        include: {
          taken_lectures: {
            include: {
              lecture: {
                include: {
                  subject_lecture_professors: true;
                };
              };
            };
          };
        };
      };
    };
  };
  type WithLectureProfessor = Prisma.friend_friendGetPayload<typeof WithLectureProfessor>;
  const WithCourse: {
    include: {
      friend: {
        include: {
          taken_lectures: {
            include: {
              lecture: true;
            };
          };
        };
      };
    };
  };
  type WithCourse = Prisma.friend_friendGetPayload<typeof WithCourse>;
}
