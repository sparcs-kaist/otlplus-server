import { CourseBasic, CourseScore } from '@otl/server-nest/modules/courses/domain/course'

export const COURSE_REPOSITORY = Symbol('COURSE_REPOSITORY')
export interface ServerConsumerCourseRepository {
  updateCourseScore(courseId: number, grades: CourseScore): Promise<CourseBasic>
}
