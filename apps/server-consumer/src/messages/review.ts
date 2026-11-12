import { EVENT_TYPE, Message } from '@otl/server-consumer/messages/message'

export class ReviewUpdateMessage extends Message {
  reviewId!: number
}

export class ReviewLikeUpdateMessage extends ReviewUpdateMessage {
  public static isValid(msg: unknown): msg is ReviewLikeUpdateMessage {
    return (
      typeof msg === 'object' && msg !== null && 'reviewId' in msg && typeof msg.reviewId === 'number' && 'type' in msg && typeof msg.type === 'string' && msg.type === EVENT_TYPE.REVIEW_LIKE
    )
  }
}
