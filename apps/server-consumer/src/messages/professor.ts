import { EVENT_TYPE, Message } from '@otl/server-consumer/messages/message'

export class ProfessorUpdateMessage extends Message {
  professorId!: number
}

export class ProfessorScoreUpdateMessage extends ProfessorUpdateMessage {
  public static isValid(msg: any): msg is ProfessorUpdateMessage {
    return (
      msg
      && typeof msg.professorId === 'number'
      && typeof msg.type === 'string'
      && msg.type === EVENT_TYPE.PROFESSOR_SCORE
    )
  }
}
