import { IScholar } from '@otl/scholar-sync/clients/scholar/IScholar'

import { ELecture } from '@otl/prisma-client/entities'

export class ExamtimeInfo {
  day!: number

  begin!: Date

  end!: Date

  public static deriveExamtimeInfo(examtime: IScholar.ScholarExamtimeType): ExamtimeInfo {
    const beginHours = String(examtime.EXAM_BEGIN.hours).padStart(2, '0')
    const beginMinutes = String(examtime.EXAM_BEGIN.minutes).padStart(2, '0')
    const endHours = String(examtime.EXAM_END.hours).padStart(2, '0')
    const endMinutes = String(examtime.EXAM_END.minutes).padStart(2, '0')

    return {
      day: examtime.EXAM_DAY,
      begin: new Date(`1970-01-01T${beginHours}:${beginMinutes}:00Z`),
      end: new Date(`1970-01-01T${endHours}:${endMinutes}:00Z`),
    }
  }

  public static equals(examtime: ExamtimeInfo, existing: ELecture.Details['subject_examtime'][number]) {
    return (
      examtime.day === existing.day
      && examtime.begin.getHours() === existing.begin.getHours()
      && examtime.begin.getMinutes() === existing.begin.getMinutes()
    )
  }
}
