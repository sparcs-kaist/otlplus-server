import { EVENT_TYPE, Message } from '@otl/server-consumer/messages/message'

export class LectureUpdateMessage extends Message {
  lectureId!: number
}

export class LectureCommonTitleUpdateMessage extends LectureUpdateMessage {
  courseId!: number

  public static isValid(msg: unknown): msg is LectureCommonTitleUpdateMessage {
    return (
      typeof msg === 'object' && msg !== null && 'lectureId' in msg && typeof msg.lectureId === 'number'
      && 'courseId' in msg && typeof msg.courseId === 'number'
      && 'type' in msg && typeof msg.type === 'string'
      && msg.type === EVENT_TYPE.LECTURE_TITLE
    )
  }
}

export class LectureScoreUpdateMessage extends LectureUpdateMessage {
  public static isValid(msg: unknown): msg is LectureScoreUpdateMessage {
    return (
      typeof msg === 'object' && msg !== null && 'lectureId' in msg && typeof msg.lectureId === 'number' && 'type' in msg && typeof msg.type === 'string' && msg.type === EVENT_TYPE.LECTURE_SCORE
    )
  }
}

export class LectureNumPeopleUpdateMessage extends LectureUpdateMessage {
  public static isValid(msg: unknown): msg is LectureNumPeopleUpdateMessage {
    return (
      typeof msg === 'object' && msg !== null && 'lectureId' in msg && typeof msg.lectureId === 'number'
      && 'type' in msg && typeof msg.type === 'string'
      && msg.type === EVENT_TYPE.LECTURE_NUM_PEOPLE
    )
  }
}
