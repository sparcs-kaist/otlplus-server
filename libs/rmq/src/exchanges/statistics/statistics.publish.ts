// import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
// import { Injectable } from '@nestjs/common'
// import settings, { ExchangeNames, QueueSymbols } from '@otl/rmq/settings'
// import { SyncServerStatisticsMQ } from '@otl/scholar-sync/domain/out/StatisticsMQ'
// import { CourseScoreUpdateMessage } from '@otl/server-consumer/messages/course'
// import { LectureNumPeopleUpdateMessage, LectureScoreUpdateMessage } from '@otl/server-consumer/messages/lecture'
// import { EVENT_TYPE } from '@otl/server-consumer/messages/message'
// import { ProfessorScoreUpdateMessage } from '@otl/server-consumer/messages/professor'
// import { ReviewMQ } from '@otl/server-nest/modules/reviews/domain/out/ReviewMQ'
// import { TimetableMQ } from '@otl/server-nest/modules/timetables/domain/out/TimetableMQ'
// import { RabbitPublisherService } from '@otl/rmq/rabbitmq.publisher'
//
// @Injectable()
// export class StatisticsUpdatePublisher implements SyncServerStatisticsMQ, TimetableMQ, ReviewMQ {
//   constructor(
//     private readonly amqpConnection: AmqpConnection,
//     private readonly rabbitPublisherService: RabbitPublisherService,
//   ) {}
//
//   async publishLectureScoreUpdate(lectureId: number): Promise<boolean> {
//     const exchange = settings().getRabbitMQConfig().exchangeConfig.exchangeMap[ExchangeNames.STATISTICS]
//     const routingKey = settings().getRabbitMQConfig().queueConfig[QueueSymbols.STATISTICS].routingKey as string
//     const lectureUpdateMessage: LectureScoreUpdateMessage = {
//       lectureId,
//       type: EVENT_TYPE.LECTURE_SCORE,
//     }
//     return await this.amqpConnection.publish(exchange.name, routingKey, lectureUpdateMessage)
//   }
//
//   async publishCourseScoreUpdate(courseId: number): Promise<boolean> {
//     const exchange = settings().getRabbitMQConfig().exchangeConfig.exchangeMap[ExchangeNames.STATISTICS]
//     const routingKey = settings().getRabbitMQConfig().queueConfig[QueueSymbols.STATISTICS].routingKey as string
//     const courseScoreUpdateMessage: CourseScoreUpdateMessage = {
//       courseId,
//       type: EVENT_TYPE.COURSE_SCORE,
//     }
//     return await this.amqpConnection.publish(exchange.name, routingKey, courseScoreUpdateMessage)
//   }
//
//   async publishLectureNumUpdate(lectureId: number): Promise<boolean> {
//     const exchange = settings().getRabbitMQConfig().exchangeConfig.exchangeMap[ExchangeNames.STATISTICS]
//     const routingKey = settings().getRabbitMQConfig().queueConfig[QueueSymbols.STATISTICS].routingKey as string
//     const lectureNumPeopleUpdateMessage: LectureNumPeopleUpdateMessage = {
//       lectureId,
//       type: EVENT_TYPE.LECTURE_NUM_PEOPLE,
//     }
//     return await this.amqpConnection.publish(exchange.name, routingKey, lectureNumPeopleUpdateMessage)
//   }
//
//   async publishProfessorScoreUpdate(professorId: number): Promise<boolean> {
//     const exchange = settings().getRabbitMQConfig().exchangeConfig.exchangeMap[ExchangeNames.STATISTICS]
//     const routingKey = settings().getRabbitMQConfig().queueConfig[QueueSymbols.STATISTICS].routingKey as string
//     const professorScoreUpdateMessage: ProfessorScoreUpdateMessage = {
//       professorId,
//       type: EVENT_TYPE.PROFESSOR_SCORE,
//     }
//     return await this.amqpConnection.publish(exchange.name, routingKey, professorScoreUpdateMessage)
//   }
//
//   async publishReviewLikeUpdate(reviewId: number): Promise<boolean> {
//     const exchange = settings().getRabbitMQConfig().exchangeConfig.exchangeMap[ExchangeNames.STATISTICS]
//     const routingKey = settings().getRabbitMQConfig().queueConfig[QueueSymbols.STATISTICS].routingKey as string
//     const reviewLikeUpdateMessage = {
//       reviewId,
//       type: EVENT_TYPE.REVIEW_LIKE,
//     }
//     return await this.amqpConnection.publish(exchange.name, routingKey, reviewLikeUpdateMessage)
//   }
// }
