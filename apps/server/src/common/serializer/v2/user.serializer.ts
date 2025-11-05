import { IUserV2 } from '@otl/server-nest/common/interfaces/v2'
import { CourseBasic } from '@otl/server-nest/modules/courses/domain/course'

import { ELecture, EWishlist } from '@otl/prisma-client/entities'

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

export const toJsonWishlistV2 = (
  wishlist: EWishlist.WithLectures,
  courses: Map<number, CourseBasic>,
  takenCourseIds: Set<number>,
  language: string,
): IUserV2.WishlistResponse => {
  // Group lectures by course_id
  const courseMap = new Map<number, ELecture.Details[]>()

  wishlist.timetable_wishlist_lectures.forEach((wishlistLecture) => {
    const lecture = wishlistLecture.subject_lecture
    const courseId = lecture.course_id

    if (!courseMap.has(courseId)) {
      courseMap.set(courseId, [])
    }
    courseMap.get(courseId)!.push(lecture)
  })

  // Convert to courses array
  const coursesArray: IUserV2.WishlistCourseItem[] = Array.from(courseMap.entries())
    .map(([courseId, lectures]) => {
      const course = courses.get(courseId)
      if (!course) {
        // Course not found, skip (should not happen)
        return null
      }

      return {
        name: language === 'en' && course.titleEn ? course.titleEn : course.title,
        code: course.newCode,
        type: language === 'en' && course.typeEn ? course.typeEn : course.type,
        completed: takenCourseIds.has(courseId),
        lectures: lectures.map((lecture) => ({
          id: lecture.id,
          name: language === 'en' && lecture.title_en ? lecture.title_en : lecture.title,
          code: lecture.new_code,
          classNo: lecture.class_no,
          professors: lecture.subject_lecture_professors.map((lp) => ({
            id: lp.professor_id,
            name:
              language === 'en' && lp.professor.professor_name_en
                ? lp.professor.professor_name_en
                : lp.professor.professor_name,
          })),
        })),
      }
    })
    .filter((course): course is IUserV2.WishlistCourseItem => course !== null)
    .sort((a, b) => a.code.localeCompare(b.code))

  return {
    courses: coursesArray,
  }
}
