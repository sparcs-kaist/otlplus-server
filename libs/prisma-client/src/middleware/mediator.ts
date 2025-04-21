import { IPrismaMiddleware } from './IPrismaMiddleware'
import { CourseMiddleware } from './prisma.course'
import { DepartmentMiddleware } from './prisma.department'
import { LectureMiddleware } from './prisma.lecture'
import { LectureProfessorsMiddleware } from './prisma.lectureprofessors'
import { ReviewMiddleware } from './prisma.reviews'
import { ReviewVoteMiddleware } from './prisma.reviewvote'
import { SemesterMiddleware } from './prisma.semester'
import { TimetableMiddleware } from './prisma.timetable'
import { TimetableLectureMiddleware } from './prisma.timetablelecture'

export const mediator = (model: string | undefined): IPrismaMiddleware.Middleware | null => {
  if (model === 'review_review') {
    return ReviewMiddleware.getInstance()
  }
  if (model === 'review_reviewvote') {
    return ReviewVoteMiddleware.getInstance()
  }
  if (model === 'timetable_timetable') {
    return TimetableMiddleware.getInstance()
  }
  if (model === 'timetable_timetable_lectures') {
    return TimetableLectureMiddleware.getInstance()
  }
  if (model === 'subject_semester') {
    return SemesterMiddleware.getInstance()
  }
  if (model === 'subject_lecture_professors') {
    return LectureProfessorsMiddleware.getInstance()
  }
  if (model === 'subject_lecture') {
    return LectureMiddleware.getInstance()
  }
  if (model === 'subject_course') {
    return CourseMiddleware.getInstance()
  }
  if (model === 'subject_department') {
    return DepartmentMiddleware.getInstance()
  }
  return null
}
// todo : moduleRef 적용해보기
