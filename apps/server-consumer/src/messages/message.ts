export const EVENT_TYPE = {
  LECTURE_TITLE: 'lecture.title.update',
  LECTURE_SCORE: 'lecture.score.update',
  COURSE_SCORE: 'course.score.update',
  PROFESSOR_SCORE: 'professor.score.update',
  REVIEW_LIKE: 'review.like.update',
  LECTURE_NUM_PEOPLE: 'lecture.numPeople.update',
} as const

export type EVENT_TYPE = (typeof EVENT_TYPE)[keyof typeof EVENT_TYPE]

export class Message {
  type!: EVENT_TYPE
}
