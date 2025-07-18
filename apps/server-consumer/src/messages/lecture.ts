export const LECTURE_EVENT_TYPE = {
  TITLE: 'lecture.title.update',
  SCORE: 'lecture.score.update',
} as const

export type LECTURE_EVENT_TYPE = (typeof LECTURE_EVENT_TYPE)[keyof typeof LECTURE_EVENT_TYPE]

export class LectureUpdateMessage {
  lectureId!: number

  type!: LECTURE_EVENT_TYPE
}

export class LectureCommonTitleUpdateMessage extends LectureUpdateMessage {
  title!: string

  title_en!: string

  public static isValid(msg: any): msg is LectureCommonTitleUpdateMessage {
    return (
      msg
      && typeof msg.lectureId === 'number'
      && typeof msg.type === 'string'
      && msg.type === LECTURE_EVENT_TYPE.TITLE
      && typeof msg.title === 'string'
      && typeof msg.title_en === 'string'
    )
  }
}

export class LectureScoreUpdateMessage extends LectureUpdateMessage {
  public static isValid(msg: any): msg is LectureScoreUpdateMessage {
    return (
      msg && typeof msg.lectureId === 'number' && typeof msg.type === 'string' && msg.type === LECTURE_EVENT_TYPE.SCORE
    )
  }
}
