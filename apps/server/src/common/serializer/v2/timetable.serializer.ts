import { Language } from '@otl/server-nest/common/decorators/get-language.decorator'
import { ITimetableV2 } from '@otl/server-nest/common/interfaces/v2'
// import { toJsonClasstime } from '@otl/server-nest/common/serializer/classtime.serializer'
import { toJsonExamtime } from '@otl/server-nest/common/serializer/examtime.serializer'

import { getTimeNumeric } from '@otl/common/utils/util'

import { ELecture, ETimetable } from '@otl/prisma-client/entities'

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
  lectures: timetable.timetable_timetable_lectures.map((lecture) => ({
    id: lecture.subject_lecture.id,
    courseId: lecture.subject_lecture.course_id,
    classNo: lecture.subject_lecture.class_no,
    name: (language === 'en' ? lecture.subject_lecture.common_title_en : lecture.subject_lecture.common_title) ?? '',
    subtitle:
      language === 'en'
        ? lecture.subject_lecture.title_en.replace(lecture.subject_lecture.common_title_en ?? '', '')
        : lecture.subject_lecture.title.replace(lecture.subject_lecture.common_title ?? '', ''),
    code: lecture.subject_lecture.new_code,

    department: {
      id: lecture.subject_lecture.subject_department.id,
      name:
        language === 'en'
          ? (lecture.subject_lecture.subject_department.name_en ?? '')
          : (lecture.subject_lecture.subject_department.name ?? ''),
    },

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
      buildingCode: classtime.building_id ?? '',
      buildingName: language === 'en' ? classtime.building_full_name_en : classtime.building_full_name,
      // placeNameShort: (() => {
      //   const temp = toJsonClasstime(classtime)
      //   return language === 'en' ? temp.classroom_short_en : temp.classroom_short
      // })(),
      roomName: classtime.room_name ?? '',
    })) as ITimetableV2.ClassResDto[],

    examTimes: lecture.subject_lecture.subject_examtime.map((examtime) => ({
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
    })),
    classDuration: lecture.subject_lecture.num_classes,
    expDuration: lecture.subject_lecture.num_labs,
  })),
})

export const toJsonLectures = (lectures: ELecture.Details[], language: Language): ITimetableV2.GetResDto => ({
  lectures: lectures.map((lecture) => ({
    id: lecture.id,
    courseId: lecture.course_id,
    classNo: lecture.class_no,
    name: (language === 'en' ? lecture.common_title_en : lecture.common_title) ?? '',
    subtitle:
      language === 'en'
        ? lecture.title_en.replace(lecture.common_title_en ?? '', '')
        : lecture.title.replace(lecture.common_title ?? '', ''),
    code: lecture.new_code,

    department: {
      id: lecture.subject_department.id,
      name: language === 'en' ? (lecture.subject_department.name_en ?? '') : (lecture.subject_department.name ?? ''),
    },

    type: lecture.type,
    limitPeople: lecture.limit,
    numPeople: lecture.num_people ?? 0,
    credit: lecture.credit,
    creditAU: lecture.credit_au,
    averageGrade: lecture.grade,
    averageLoad: lecture.load,
    averageSpeech: lecture.speech,
    isEnglish: lecture.is_english,

    professors: lecture.subject_lecture_professors.map((professor) => ({
      id: professor.professor_id,
      name: (language === 'en' ? professor.professor.professor_name_en : professor.professor.professor_name) ?? '',
    })) as ITimetableV2.ProfessorResDto[],

    classes: lecture.subject_classtime.map((classtime) => ({
      day: classtime.day,
      begin: getTimeNumeric(classtime.begin),
      end: getTimeNumeric(classtime.end),
      buildingCode: classtime.building_id ?? '',
      buildingName: language === 'en' ? classtime.building_full_name_en : classtime.building_full_name,
      // placeNameShort: (() => {
      //   const temp = toJsonClasstime(classtime)
      //   return language === 'en' ? temp.classroom_short_en : temp.classroom_short
      // })(),
      roomName: classtime.room_name ?? '',
    })) as ITimetableV2.ClassResDto[],

    examTimes: lecture.subject_examtime.map((examtime) => ({
      day: examtime.day,
      // TODO: what is this field? -> "월요일 09:00 ~ 11:45"
      str: (() => {
        const temp = toJsonExamtime(examtime)
        return language === 'en' ? temp.str_en : temp.str
      })(),
      begin: getTimeNumeric(examtime.begin, false),
      end: getTimeNumeric(examtime.end, false),
    })),
    classDuration: lecture.num_classes,
    expDuration: lecture.num_labs,
  })),
})
