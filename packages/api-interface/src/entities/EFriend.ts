import { Prisma } from '@prisma/client';
import { EUser } from './EUser';
export namespace EFriend {
  export const Basic = Prisma.validator<Prisma.friend_friendDefaultArgs>()({
    include: {
      friend: true,
    },
  });

  export type Basic = Prisma.friend_friendGetPayload<typeof Basic> & {
    friend: EUser.Basic;
  };

  export const WithLecture = Prisma.validator<Prisma.friend_friendDefaultArgs>()({
    include: {
      friend: {
        include: {
          taken_lectures: true,
        },
      },
    },
  });

  export type WithLecture = Prisma.friend_friendGetPayload<typeof WithLecture>;

  export const WithLectureProfessor = Prisma.validator<Prisma.friend_friendDefaultArgs>()({
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

  export type WithLectureProfessor = Prisma.friend_friendGetPayload<typeof WithLectureProfessor>;
}
