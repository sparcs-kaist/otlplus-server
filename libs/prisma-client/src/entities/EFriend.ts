import { Prisma } from '@prisma/client'

export namespace EFriend {
  export const Summary = Prisma.validator<Prisma.session_userprofile_friendsDefaultArgs>()({
    select: {
      id: true,
      userprofile_id: true,
      friend_userprofile_id: true,
      is_favorite: true,
      created_at: true,
      friend_profile: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
        },
      },
    },
  })

  export const WithTakenLectures = (courseId: number) => Prisma.validator<Prisma.session_userprofile_friendsDefaultArgs>()({
    select: {
      id: true,
      userprofile_id: true,
      friend_userprofile_id: true,
      is_favorite: true,
      created_at: true,
      friend_profile: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          taken_lectures: {
            where: { lecture: { course_id: courseId } },
            select: {
              lecture: {
                select: {
                  id: true,
                  course_id: true,
                  year: true,
                  semester: true,
                  subject_lecture_professors: {
                    select: { professor_id: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  export type Summary = Prisma.session_userprofile_friendsGetPayload<typeof Summary>
  export type WithTakenLectures = Prisma.session_userprofile_friendsGetPayload<ReturnType<typeof WithTakenLectures>>
}
