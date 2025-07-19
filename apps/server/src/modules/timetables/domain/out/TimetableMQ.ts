export const TIMETABLE_MQ = Symbol('TIMETABLE_MQ')
export interface TimetableMQ {
  publishLectureNumUpdate(lectureId: number): Promise<boolean>
}
