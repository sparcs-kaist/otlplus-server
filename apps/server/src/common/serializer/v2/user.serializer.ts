import { IUserV2 } from '@otl/server-nest/common/interfaces/v2'
import { CourseBasic } from '@otl/server-nest/modules/courses/domain/course'

import { getTimeNumeric } from '@otl/common'

import { ELecture, EWishlist } from '@otl/prisma-client/entities'

import { toJsonExamtime } from '../examtime.serializer'

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
  wishlist: EWishlist.WithLecturesBySemesterPayload,
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
        id: course.id,
        name: language === 'en' && course.titleEn ? course.titleEn : course.title,
        code: course.newCode,
        type: language === 'en' && course.typeEn ? course.typeEn : course.type,
        completed: takenCourseIds.has(courseId),
        lectures: lectures.map((lecture) => ({
          id: lecture.id,
          courseId: lecture.course_id,
          name: (language === 'en' && lecture.common_title_en ? lecture.common_title_en : lecture.common_title) ?? '',
          subtitle:
            language === 'en'
              ? lecture.title_en.replace(lecture.common_title_en ?? '', '')
              : lecture.title.replace(lecture.common_title ?? '', ''),
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
          limitPeople: lecture.limit,
          numPeople: lecture.num_people,
          credit: lecture.credit,
          creditAU: lecture.credit_au,
          averageGrade: lecture.grade_sum,
          averageLoad: lecture.load_sum,
          averageSpeech: lecture.speech_sum,
          isEnglish: lecture.is_english,
          professors: lecture.subject_lecture_professors.map((lp) => ({
            id: lp.professor_id,
            name:
              language === 'en' && lp.professor.professor_name_en
                ? lp.professor.professor_name_en
                : lp.professor.professor_name,
          })),
          classes: lecture.subject_classtime.map((ct) => ({
            day: ct.day,
            begin: getTimeNumeric(ct.begin, false),
            end: getTimeNumeric(ct.end, false),
            buildingCode: ct.building_id,
            buildingName:
              language === 'en' && ct.building_full_name_en ? ct.building_full_name_en : ct.building_full_name,
            roomName: ct.room_name,
          })),
          examTimes: lecture.subject_examtime.map((et) => ({
            day: et.day,
            str: (() => {
              const temp = toJsonExamtime(et)
              return language === 'en' ? temp.str_en : temp.str
            })(),
            begin: getTimeNumeric(et.begin, false),
            end: getTimeNumeric(et.end, false),
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
