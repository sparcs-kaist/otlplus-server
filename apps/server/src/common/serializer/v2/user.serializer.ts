import { IUserV2 } from '@otl/server-nest/common/interfaces/v2'

import { ELecture } from '@otl/prisma-client/entities'

export const toJsonUserLecturesV2 = (
  lectures: ELecture.Details[],
  reviewedLectureIds: Set<number>,
  totalLikesCount: number,
  language: string,
): IUserV2.LecturesResponse => {
  // Group lectures by year and semester
  const groupedMap = new Map<string, ELecture.Details[]>()

  lectures.forEach((lecture) => {
    const key = `${lecture.year}-${lecture.semester}`
    if (!groupedMap.has(key)) {
      groupedMap.set(key, [])
    }
    groupedMap.get(key)!.push(lecture)
  })

  // Convert to lecturesWrap array
  const lecturesWrap: IUserV2.LecturesWrap[] = Array.from(groupedMap.entries())
    .map(([key, lectureList]) => {
      const [year, semester] = key.split('-').map(Number)
      return {
        year,
        semester,
        lectures: lectureList.map((lecture) => ({
          name: language === 'en' && lecture.title_en ? lecture.title_en : lecture.title,
          code: lecture.new_code,
          courseId: lecture.course_id,
          lectureId: lecture.id,
          professors: lecture.subject_lecture_professors.map((lp) => ({
            id: lp.professor_id,
            name:
              language === 'en' && lp.professor.professor_name_en
                ? lp.professor.professor_name_en
                : lp.professor.professor_name,
          })),
          written: reviewedLectureIds.has(lecture.id),
        })),
      }
    })
    .sort((a, b) => {
      // Sort by year (descending), then by semester (descending)
      if (a.year !== b.year) {
        return b.year - a.year
      }
      return b.semester - a.semester
    })

  // Calculate statistics
  const totalLecturesCount = lectures.length
  const reviewedLecturesCount = reviewedLectureIds.size

  return {
    totalLecturesCount,
    reviewedLecturesCount,
    totalLikesCount,
    lecturesWrap,
  }
}
