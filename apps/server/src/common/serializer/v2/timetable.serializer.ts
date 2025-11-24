import { Language } from '@otl/server-nest/common/decorators/get-language.decorator'
import { ITimetableV2 } from '@otl/server-nest/common/interfaces/v2'
import { toJsonClasstime } from '@otl/server-nest/common/serializer/classtime.serializer'
import { toJsonExamtime } from '@otl/server-nest/common/serializer/examtime.serializer'

import { getTimeNumeric } from '@otl/common/utils/util'

import { ETimetable } from '@otl/prisma-client/entities'

export const toJsonTimetableV2 = (timetable: ETimetable.Basic): ITimetableV2.TimetableItem => ({
  id: timetable.id,
  name: timetable.name ?? '',
  year: timetable.year,
  semester: timetable.semester,
  timeTableOrder: timetable.arrange_order,
})

export const toJsonTimetableV2WithLectures = (
  timetable: ETimetable.Details,
  language: Language,
): ITimetableV2.GetResDto => ({
  id: timetable.id,
  name: timetable.name ?? '',
  userId: timetable.user_id,
  year: timetable.year ?? 0,
  semester: timetable.semester ?? 0,
  timetableOrder: timetable.arrange_order,

  // TODO: this is temporary, need to be replaced with updated lecture serializer
  // this returns specified interface, which is not exactly the same as ILecture.Detail
  // either ILectureV2.Detail or v2 serializer should be properly implemented from lecture side
  lectures: timetable.timetable_timetable_lectures.map((lecture) => ({
    id: lecture.subject_lecture.id,
    courseId: lecture.subject_lecture.course_id,
    classNo: lecture.subject_lecture.class_no,
    name: language === 'en' ? lecture.subject_lecture.title_en : lecture.subject_lecture.title,
    code: lecture.subject_lecture.new_code,

    department: [
      {
        id: lecture.subject_lecture.subject_department.id,
        name:
          language === 'en'
            ? lecture.subject_lecture.subject_department.name_en
            : lecture.subject_lecture.subject_department.name,
      },
    ],

    type: lecture.subject_lecture.type,
    limitPeople: lecture.subject_lecture.limit,
    numPeople: lecture.subject_lecture.num_people ?? 0,
    credit: lecture.subject_lecture.credit,
    creditAU: lecture.subject_lecture.credit_au,
    averageGrade: lecture.subject_lecture.grade,
    averageLoad: lecture.subject_lecture.load,
    averageSpeech: lecture.subject_lecture.speech,
    isEnglish: lecture.subject_lecture.is_english,

    professors: lecture.subject_lecture.subject_lecture_professors.map((professor) => ({
      id: professor.professor_id,
      name: (language === 'en' ? professor.professor.professor_name_en : professor.professor.professor_name) ?? '',
    })) as ITimetableV2.ProfessorResDto[],

    classes: lecture.subject_lecture.subject_classtime.map((classtime) => ({
      day: classtime.day,
      begin: getTimeNumeric(classtime.begin),
      end: getTimeNumeric(classtime.end),
      buildingCode: classtime.building_id,
      placeName: language === 'en' ? classtime.building_full_name_en : classtime.building_full_name,
      placeNameShort: (() => {
        const temp = toJsonClasstime(classtime)
        return language === 'en' ? temp.classroom_short_en : temp.classroom_short
      })(),
    })) as ITimetableV2.ClassResDto[],

    // NOTE: implemented in server as array, but specified as single object in documentation
    // this is a workaround to return single object
    examTime:
      lecture.subject_lecture.subject_examtime.map((examtime) => ({
        day: examtime.day,
        // TODO: what is this field? -> "월요일 09:00 ~ 11:45"
        str: (() => {
          const temp = toJsonExamtime(examtime)
          console.log(
            'subject_lecture',
            lecture.subject_lecture.subject_examtime.length > 0 ? 'examtime is not null' : 'examtime is null',
          )
          console.log('examtime', examtime)
          console.log('temp', temp)
          console.log('language', language)
          return language === 'en' ? temp.str_en : temp.str
        })(),
        begin: getTimeNumeric(examtime.begin, false),
        end: getTimeNumeric(examtime.end, false),
      }))[0] ?? null,
  })) as ITimetableV2.LectureResDto[],
})
