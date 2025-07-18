import { EVENT_TYPE, Message } from '@otl/server-consumer/messages/message'

export class ReviewUpdateMessage extends Message {
  reviewId!: number
}

export class ReviewLikeUpdateMessage extends ReviewUpdateMessage {
  public static isValid(msg: any): msg is ReviewLikeUpdateMessage {
    return (
      msg && typeof msg.reviewId === 'number' && typeof msg.type === 'string' && msg.type === EVENT_TYPE.REVIEW_LIKE
    )
  }
}
