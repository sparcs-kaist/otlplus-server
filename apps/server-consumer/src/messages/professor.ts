import { EVENT_TYPE, Message } from '@otl/server-consumer/messages/message'

export class ProfessorUpdateMessage extends Message {
  professorId!: number
}

export class ProfessorScoreUpdateMessage extends ProfessorUpdateMessage {
  public static isValid(msg: unknown): msg is ProfessorUpdateMessage {
    return (
      typeof msg === 'object' && msg !== null && 'professorId' in msg && typeof msg.professorId === 'number'
      && 'type' in msg && typeof msg.type === 'string'
      && msg.type === EVENT_TYPE.PROFESSOR_SCORE
    )
  }
}
