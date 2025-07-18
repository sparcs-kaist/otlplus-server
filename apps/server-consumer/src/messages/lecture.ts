import { EVENT_TYPE, Message } from '@otl/server-consumer/messages/message'

export class LectureUpdateMessage extends Message {
  lectureId!: number
}

export class LectureCommonTitleUpdateMessage extends LectureUpdateMessage {
  title!: string

  title_en!: string

  public static isValid(msg: any): msg is LectureCommonTitleUpdateMessage {
    return (
      msg
      && typeof msg.lectureId === 'number'
      && typeof msg.type === 'string'
      && msg.type === EVENT_TYPE.LECTURE_TITLE
      && typeof msg.title === 'string'
      && typeof msg.title_en === 'string'
    )
  }
}

export class LectureScoreUpdateMessage extends LectureUpdateMessage {
  public static isValid(msg: any): msg is LectureScoreUpdateMessage {
    return (
      msg && typeof msg.lectureId === 'number' && typeof msg.type === 'string' && msg.type === EVENT_TYPE.LECTURE_SCORE
    )
  }
}

export class LectureNumPeopleUpdateMessage extends LectureUpdateMessage {
  public static isValid(msg: any): msg is LectureNumPeopleUpdateMessage {
    return (
      msg
      && typeof msg.lectureId === 'number'
      && typeof msg.type === 'string'
      && msg.type === EVENT_TYPE.LECTURE_NUM_PEOPLE
    )
  }
}
