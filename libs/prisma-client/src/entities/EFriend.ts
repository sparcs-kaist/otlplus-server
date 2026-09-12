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

  const overlapLecture = Prisma.validator<Prisma.subject_lectureDefaultArgs>()({
    select: {
      id: true,
      course_id: true,
      year: true,
      semester: true,
      subject_lecture_professors: { select: { professor_id: true } },
    },
  })

  export const WithCourseLectures = (courseId: number) => Prisma.validator<Prisma.session_userprofile_friendsDefaultArgs>()({
    select: {
      ...Summary.select,
      friend_profile: {
        select: {
          ...Summary.select.friend_profile.select,
          taken_lectures: {
            where: { lecture: { course_id: courseId } },
            select: { lecture: overlapLecture },
          },
          timetable_timetable: {
            where: { timetable_timetable_lectures: { some: { subject_lecture: { course_id: courseId } } } },
            select: {
              timetable_timetable_lectures: {
                where: { subject_lecture: { course_id: courseId } },
                select: { subject_lecture: overlapLecture },
              },
            },
          },
        },
      },
    },
  })

  export type Summary = Prisma.session_userprofile_friendsGetPayload<typeof Summary>
  export type WithCourseLectures = Prisma.session_userprofile_friendsGetPayload<ReturnType<typeof WithCourseLectures>>
}
