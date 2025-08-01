import { IScholar } from '@otl/scholar-sync/clients/scholar/IScholar'
import { EVENT_TYPE, Message } from '@otl/server-consumer/messages/message'

export class SyncUpdateMessage extends Message {
  year!: number

  semester!: number
}

export class IndividualSyncUpdateRequestMessage extends SyncUpdateMessage {
  userId!: number

  studentId!: number

  requestId!: string

  public static isValid(msg: any): msg is IndividualSyncUpdateRequestMessage {
    return (
      msg
      && typeof msg.year === 'number'
      && typeof msg.semester === 'number'
      && typeof msg.userId === 'number'
      && typeof msg.studentId === 'number'
      && typeof msg.requestId === 'string'
      && typeof msg.type === 'string'
      && msg.type === EVENT_TYPE.INDIVIDUAL_SYNC_UPDATE_REQUEST
    )
  }
}

export class IndividualSyncUpdateStartMessage extends SyncUpdateMessage {
  userId!: number

  studentId!: number

  requestId!: string

  lectureData!: IScholar.ScholarDBBody

  classtimeData!: IScholar.ClasstimeBody

  examTimeData!: IScholar.ExamtimeBody

  takenLectureData!: IScholar.TakenLectureBody

  public static isValid(msg: any): msg is IndividualSyncUpdateStartMessage {
    return (
      msg
      && typeof msg.year === 'number'
      && typeof msg.semester === 'number'
      && typeof msg.studentId === 'number'
      && typeof msg.requestId === 'string'
      && typeof msg.type === 'string'
      && msg.type === EVENT_TYPE.INDIVIDUAL_SYNC_UPDATE_START
      && msg.lectureData !== undefined
      && msg.classtimeData !== undefined
      && msg.examTimeData !== undefined
      && msg.takenLectureData !== undefined
    )
  }
}
