import { IUserV2 } from '@otl/server-nest/common/interfaces/v2'
import { CourseBasic } from '@otl/server-nest/modules/courses/domain/course'

import { ELectureV2, EWishlistV2 } from '@otl/prisma-client/entities'

export const toJsonUserLecturesV2 = (
  lectures: ELectureV2.Basic[],
  reviewedLectureIds: Set<number>,
  totalLikesCount: number,
  language: string,
): IUserV2.LecturesResponse => {
  // Group lectures by year and semester
  const groupedMap = new Map<string, ELectureV2.Basic[]>()

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
  wishlist: EWishlistV2.WithLectures,
  courses: Map<number, CourseBasic>,
  takenCourseIds: Set<number>,
  language: string,
): IUserV2.WishlistResponse => {
  // Group lectures by course_id
  const courseMap = new Map<number, ELectureV2.Basic[]>()

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
        id: course.id,
        name: language === 'en' && course.titleEn ? course.titleEn : course.title,
        code: course.newCode,
        type: language === 'en' && course.typeEn ? course.typeEn : course.type,
        completed: takenCourseIds.has(courseId),
        lectures: lectures.map((lecture) => ({
          id: lecture.id,
          name: language === 'en' && lecture.title_en ? lecture.title_en : lecture.title,
          code: lecture.new_code,
          classNo: lecture.class_no,
          department: {
            id: lecture.subject_department.id,
            name:
              language === 'en' && lecture.subject_department.name_en
                ? lecture.subject_department.name_en
                : lecture.subject_department.name,
          },
          type: language === 'en' && lecture.type_en ? lecture.type_en : lecture.type,
          limitPeople: lecture.limit_people,
          numPeople: lecture.num_people,
          credit: lecture.credit,
          creditAU: lecture.credit_au,
          averageGrade: lecture.average_grade,
          averageLoad: lecture.average_load,
          averageSpeech: lecture.average_speech,
          isEnglish: lecture.is_english,
          professors: lecture.subject_lecture_professors.map((lp) => ({
            id: lp.professor_id,
            name:
              language === 'en' && lp.professor.professor_name_en
                ? lp.professor.professor_name_en
                : lp.professor.professor_name,
          })),
          classes: lecture.class_times.map((ct) => ({
            day: ct.day,
            begin: ct.begin,
            end: ct.end,
            buildingCode: ct.building_code,
            buildingName: language === 'en' && ct.building_name_en ? ct.building_name_en : ct.building_name,
            roomName: ct.room_name,
          })),
          examTimes: lecture.exam_times.map((et) => ({
            day: et.day,
            str: language === 'en' && et.str_en ? et.str_en : et.str,
            begin: et.begin,
            end: et.end,
          })),
          classDuration: lecture.num_classes,
          expDuration: lecture.num_labs,
        })),
      }
    })
    .filter((course): course is IUserV2.WishlistCourseItem => course !== null)
    .sort((a, b) => a.code.localeCompare(b.code))

  return {
    courses: coursesArray,
  }
}
