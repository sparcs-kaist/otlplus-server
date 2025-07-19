import { EVENT_TYPE, Message } from '@otl/server-consumer/messages/message'

export class CourseUpdateMessage extends Message {
  courseId!: number
}

export class CourseScoreUpdateMessage extends CourseUpdateMessage {
  public static isValid(msg: any): msg is CourseUpdateMessage {
    return (
      msg && typeof msg.courseId === 'number' && typeof msg.type === 'string' && msg.type === EVENT_TYPE.COURSE_SCORE
    )
  }
}
