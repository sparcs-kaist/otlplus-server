import { Course } from '@otl/server-nest/modules/courses/domain/course'
import { Lecture } from '@otl/server-nest/modules/lectures/domain/lecture'
import { User, UserWithRelations } from '@otl/server-nest/modules/user/domain/User'

export class Review {
  id!: number

  courseId!: number

  lectureId!: number

  content!: string

  grade!: number

  load!: number

  speech!: number

  writerId!: number | null

  anonymousName!: string

  updatedAt!: Date

  likeCnt!: number

  isDeleted!: number

  writedAt!: Date | null
}

export type ReviewRelationMap = {
  writer: User
  writerWithDepartment: UserWithRelations<'department'>
  course: Course
  lecture: Lecture
}

export type ReviewWithRelations<T extends keyof ReviewRelationMap = never> = Review & Pick<ReviewRelationMap, T>

export type ReviewBasic = ReviewWithRelations
export type ReviewWithCourse = ReviewWithRelations<'course'>
export type ReviewWithLecture = ReviewWithRelations<'lecture'>
export type ReviewWithUser = ReviewWithRelations<'writer'>
export type ReviewWithCourseAndLecture = ReviewWithRelations<'course' | 'lecture'>
export type ReviewWithCourseAndUser = ReviewWithRelations<'course' | 'writer'>
export type ReviewWithLectureAndUser = ReviewWithRelations<'lecture' | 'writer'>
export type ReviewWithCourseLectureAndUser = ReviewWithRelations<'course' | 'lecture' | 'writer'>
