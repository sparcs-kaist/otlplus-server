export const EVENT_TYPE = {
  LECTURE_TITLE: 'lecture.title.update',
  LECTURE_SCORE: 'lecture.score.update',
  COURSE_SCORE: 'course.score.update',
  COURSE_REPRESENTATIVE_LECTURE: 'course.representativeLecture.update',
  PROFESSOR_SCORE: 'professor.score.update',
  REVIEW_LIKE: 'review.like.update',
  LECTURE_NUM_PEOPLE: 'lecture.numPeople.update',
  INDIVIDUAL_SYNC_UPDATE_REQUEST: 'individual.sync.update.request',
  INDIVIDUAL_SYNC_UPDATE_START: 'individual.sync.update.start',
} as const

export type EVENT_TYPE = (typeof EVENT_TYPE)[keyof typeof EVENT_TYPE]

export class Message {
  type!: EVENT_TYPE
}
