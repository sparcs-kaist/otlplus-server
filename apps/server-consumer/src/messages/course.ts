import { EVENT_TYPE, Message } from '@otl/server-consumer/messages/message'

export class CourseUpdateMessage extends Message {
  courseId!: number
}

export class CourseScoreUpdateMessage extends CourseUpdateMessage {
  public static isValid(msg: unknown): msg is CourseUpdateMessage {
    return (
      typeof msg === 'object' && msg !== null && 'courseId' in msg && typeof msg.courseId === 'number' && 'type' in msg && typeof msg.type === 'string' && msg.type === EVENT_TYPE.COURSE_SCORE
    )
  }
}

export class CourseRepresentativeLectureUpdateMessage extends CourseUpdateMessage {
  lectureId!: number | null

  public static isValid(msg: unknown): msg is CourseRepresentativeLectureUpdateMessage {
    return (
      typeof msg === 'object' && msg !== null && 'courseId' in msg && typeof msg.courseId === 'number'
      && 'type' in msg && typeof msg.type === 'string'
      && msg.type === EVENT_TYPE.COURSE_REPRESENTATIVE_LECTURE
      && 'lectureId' in msg && (msg.lectureId === null || typeof msg.lectureId === 'number')
    )
  }
}
