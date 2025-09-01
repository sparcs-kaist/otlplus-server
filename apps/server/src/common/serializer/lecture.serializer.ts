import { ILecture, IUser } from '@otl/server-nest/common/interfaces'
import { session_userprofile } from '@prisma/client'

import { applyOrder } from '@otl/common/utils'

import { LectureRepository, WishlistRepository } from '@otl/prisma-client'
import { ELecture } from '@otl/prisma-client/entities'

import { toJsonClasstime, v2toJsonClasstime } from './classtime.serializer'
import { toJsonExamtime, v2toJsonExamtime } from './examtime.serializer'
import { toJsonProfessors, v2toJsonProfessors } from './professor.serializer'

export function toJsonLectureMinimal(lecture: ELecture.Basic): ILecture.Minimal {
  return {
    id: lecture.id,
    title: lecture.title,
    title_en: lecture.title_en,
    course: {
      id: lecture.course_id,
    },
    course_id: lecture.course_id,
    audience: lecture.audience,
    old_old_code: lecture.old_code,
    old_code: lecture.new_code,
    class_no: lecture.class_no,
    year: lecture.year,
    semester: lecture.semester,
    code: lecture.code,
    department: {
      id: lecture.department_id,
    },
    type: lecture.type,
    type_en: lecture.type_en,
    credit: lecture.credit,
    credit_au: lecture.credit_au,
    num_classes: lecture.num_classes,
    num_labs: lecture.num_labs,
    limit: lecture.limit,
    num_people: lecture.num_people ?? 0,
    is_english: lecture.is_english,
    deleted: lecture.deleted,
    class_title: lecture.class_title ?? '',
    class_title_en: lecture.class_title_en ?? '',
    common_title: lecture.common_title ?? '',
    common_title_en: lecture.common_title_en ?? '',
    title_en_no_space: lecture.title_en.replace(/\s/g, ''),
    title_no_space: lecture.title.replace(/\s/g, ''),
    grade_sum: lecture.grade_sum + 0.000001,
    load_sum: lecture.load_sum + 0.000001,
    speech_sum: lecture.speech_sum + 0.000001,
    grade: lecture.grade + 0.000001,
    load: lecture.load + 0.000001,
    speech: lecture.speech + 0.000001,
    review_total_weight: lecture.review_total_weight + 0.000001,
  }
}

export function toJsonLectureBasic(lecture: ELecture.Extended): ILecture.Basic {
  const professors = lecture.subject_lecture_professors.map((x) => x.professor)
  const ordered_professors = applyOrder(professors, ['professor_name'])

  return {
    id: lecture.id,
    title: lecture.title,
    title_en: lecture.title_en,
    course: lecture.course_id,
    old_old_code: lecture.old_code,
    old_code: lecture.new_code,
    class_no: lecture.class_no,
    year: lecture.year,
    semester: lecture.semester,
    code: lecture.code,
    department: lecture.department_id,
    department_code: lecture.subject_department.code,
    department_name: lecture.subject_department.name,
    department_name_en: lecture.subject_department.name_en ?? lecture.subject_department.name,
    type: lecture.type,
    type_en: lecture.type_en,
    limit: lecture.limit,
    num_people: lecture.num_people ?? 0,
    is_english: lecture.is_english,
    num_classes: lecture.num_classes,
    num_labs: lecture.num_labs,
    credit: lecture.credit,
    credit_au: lecture.credit_au,
    common_title: lecture.common_title ?? '',
    common_title_en: lecture.common_title_en ?? '',
    class_title: lecture.class_title ?? '',
    class_title_en: lecture.class_title_en ?? '',
    review_total_weight: lecture.review_total_weight + 0.000001,
    professors: toJsonProfessors(ordered_professors),
  }
}

export function toJsonLectureDetail(lecture: ELecture.Details): ILecture.Detail {
  const basic = toJsonLectureBasic(lecture)
  if (!ELecture.isDetails(lecture)) throw new Error(`Lecture is not of type ${ELecture.Details}`)

  return Object.assign(basic, {
    grade: lecture.grade + 0.000001,
    load: lecture.load + 0.000001,
    speech: lecture.speech + 0.000001,
    classtimes: lecture.subject_classtime.map((classtime) => toJsonClasstime(classtime)),
    examtimes: lecture.subject_examtime.map((examtime) => toJsonExamtime(examtime)),
  })
}

export function v2toJsonLectureDetail(lecture: ELecture.Details): ILecture.v2Detail {
  if (!ELecture.isDetails(lecture)) throw new Error(`Lecture is not of type ${ELecture.Details}`)

  return {
    lectureId: lecture.id,
    courseId: lecture.course_id,
    classNo: lecture.class_no,
    lectureName: lecture.title,
    code: lecture.code,
    departmentId: lecture.department_id,
    type: lecture.type,
    limitPeople: lecture.limit,
    numPeople: lecture.num_people,
    lectureDuration:
      (new Date(lecture.subject_classtime[0].end).getTime() - new Date(lecture.subject_classtime[0].begin).getTime())
      / 1000
      / 60,
    credit: lecture.credit,
    au: lecture.credit_au,
    scoreGrade: lecture.grade,
    scoreLoad: lecture.load,
    scoreSpeech: lecture.speech,
    isEnglish: lecture.is_english,
    professors: v2toJsonProfessors(lecture.subject_lecture_professors.map((x) => x.professor)),
    classes: lecture.subject_classtime.map((classtime) => v2toJsonClasstime(classtime)),
    examTimes: lecture.subject_examtime.map((examtime) => v2toJsonExamtime(examtime)),
  }
}

export async function v2toJsonLectureWithCourseDetail(
  lecture: ELecture.DetailsWithCourse,
  lectureRepository: LectureRepository,
  user: session_userprofile,
  includeWishlist: boolean,
  wishlistRepository?: WishlistRepository,
): Promise<ILecture.v2Response | ILecture.v2Response2> {
  const lectureData = await lectureRepository.getLectureById(lecture.id)
  const takenLectures = await lectureRepository.getTakenLectures(user)
  const completedCourse = takenLectures.some((l: any) => l.course_id === lectureData.courseId)

  let isWishlited: boolean | undefined

  if (includeWishlist) {
    if (!wishlistRepository) {
      throw new Error('wishlistRepository is required when includeWishlist is true.')
    }
    const wishlist = await wishlistRepository.getOrCreateWishlist(user.id)
    const findLectureInWishlist = await wishlistRepository.getLectureInWishlist(wishlist.id, lecture.id)
    isWishlited = findLectureInWishlist !== null
  }

  const baseLecture = {
    lectureId: lecture.id,
    courseId: lecture.course_id,
    classNo: lecture.class_no,
    lectureName: lecture.title,
    code: lecture.code,
    departmentId: lecture.department_id,
    type: lecture.type,
    limitPeople: lecture.limit,
    numPeople: lecture.num_people,
    lectureDuration:
      (new Date(lecture.subject_classtime[0].end).getTime() - new Date(lecture.subject_classtime[0].begin).getTime())
      / 1000
      / 60,
    credit: lecture.credit,
    au: lecture.credit_au,
    scoreGrade: lecture.grade,
    scoreLoad: lecture.load,
    scoreSpeech: lecture.speech,
    isEnglish: lecture.is_english,
    professors: v2toJsonProfessors(lecture.subject_lecture_professors.map((x) => x.professor)),
    classes: lecture.subject_classtime.map((classtime) => v2toJsonClasstime(classtime)),
    examTimes: lecture.subject_examtime.map((examtime) => v2toJsonExamtime(examtime)),
  }

  return {
    name: lecture.course.title,
    code: lecture.course.new_code,
    type: lecture.course.type,
    completedCourse,
    lectures: includeWishlist ? { ...baseLecture, isWishlited } : baseLecture,
  } as ILecture.v2Response | ILecture.v2Response2
}

export async function v2toJsonTakenLectures(
  lectures: ELecture.Details[],
  totalLikes: number,
  reviewIds: number[],
): Promise<IUser.v2TakenLectures> {
  const takenLecturesJsons = []

  for (const lecture of lectures) {
    let added = false
    for (const takenlist of takenLecturesJsons) {
      if (takenlist.year === lecture.year && takenlist.semester === lecture.semester) {
        // const professor = lecture.subject_lecture_professors
        takenlist.lectures.push({
          lectureId: lecture.id,
          code: lecture.code,
          lectureName: lecture.title,
          isReviewed: lecture.id in reviewIds,
          courseId: lecture.course_id,
          professorId: lecture.subject_lecture_professors[0].professor_id,
        })
        added = true
        break
      }
    }
    if (added === false) {
      takenLecturesJsons.push({
        year: lecture.year,
        semester: lecture.semester,
        lectures: [
          {
            lectureId: lecture.id,
            code: lecture.code,
            lectureName: lecture.title,
            isReviewed: lecture.id in reviewIds,
            courseId: lecture.course_id,
            professorId: lecture.subject_lecture_professors[0].professor_id,
          },
        ],
      })
    }
  }

  return {
    totalLectures: lectures.length,
    reviewdLectures: reviewIds.length,
    totalLikes,
    info: takenLecturesJsons,
  }
}
