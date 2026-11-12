import { CourseRepresentativeLectureUpdateMessage, CourseScoreUpdateMessage } from './course'
import { LectureCommonTitleUpdateMessage, LectureNumPeopleUpdateMessage, LectureScoreUpdateMessage } from './lecture'
import { EVENT_TYPE } from './message'
import { ProfessorScoreUpdateMessage } from './professor'
import { ReviewLikeUpdateMessage } from './review'

it.each([
  [CourseScoreUpdateMessage, { type: EVENT_TYPE.COURSE_SCORE, courseId: 1 }],
  [CourseRepresentativeLectureUpdateMessage, { type: EVENT_TYPE.COURSE_REPRESENTATIVE_LECTURE, courseId: 1, lectureId: null }],
  [LectureCommonTitleUpdateMessage, { type: EVENT_TYPE.LECTURE_TITLE, lectureId: 1, courseId: 2 }],
  [LectureScoreUpdateMessage, { type: EVENT_TYPE.LECTURE_SCORE, lectureId: 1 }],
  [LectureNumPeopleUpdateMessage, { type: EVENT_TYPE.LECTURE_NUM_PEOPLE, lectureId: 1 }],
  [ProfessorScoreUpdateMessage, { type: EVENT_TYPE.PROFESSOR_SCORE, professorId: 1 }],
  [ReviewLikeUpdateMessage, { type: EVENT_TYPE.REVIEW_LIKE, reviewId: 1 }],
] as const)('validates %p without trusting untyped message input', (validator, valid) => {
  expect(validator.isValid(valid)).toBe(true)
  for (const invalid of [null, undefined, 0, 'message', [], {}, { ...valid, type: 'wrong' }]) {
    expect(validator.isValid(invalid)).toBe(false)
  }
})

it('requires a numeric or null representative lecture id', () => {
  const message = { type: EVENT_TYPE.COURSE_REPRESENTATIVE_LECTURE, courseId: 1 }
  expect(CourseRepresentativeLectureUpdateMessage.isValid(message)).toBe(false)
  expect(CourseRepresentativeLectureUpdateMessage.isValid({ ...message, lectureId: '1' })).toBe(false)
  expect(CourseRepresentativeLectureUpdateMessage.isValid({ ...message, lectureId: 2 })).toBe(true)
})
