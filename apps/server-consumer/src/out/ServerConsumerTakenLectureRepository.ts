import {
  ClassTimeInfo,
  CourseInfo,
  DepartmentInfo,
  ExamtimeInfo,
  LectureInfo,
  ProfessorInfo,
} from '@otl/scholar-sync/domain'
import { LectureBasic } from '@otl/server-nest/modules/lectures/domain/lecture'

import {
  ECourse, EDepartment, ELecture, EProfessor, EUser,
} from '@otl/prisma-client'

export const TAKENLECTURE_REPOSITORY = Symbol('TAKENLECTURE_REPOSITORY')
export interface ServerConsumerTakenLectureRepository {
  getExistingLectures({ year, semester }: { year: number, semester: number }): Promise<LectureBasic[]>

  getOrCreateStaffProfessor(): Promise<EProfessor.Basic>

  getExistingDepartments(): Promise<EDepartment.Basic[]>

  createDepartment(departmentInfo: DepartmentInfo): Promise<EDepartment.Basic>

  updateDepartment(id: number, data: Partial<EDepartment.Basic>): Promise<EDepartment.Basic>

  getExistingCoursesByNewCodes(strings: string[]): Promise<ECourse.Basic[]>

  createCourse(derivedCourse: CourseInfo): Promise<ECourse.Basic>

  updateCourse(id: number, derivedCourse: CourseInfo): Promise<ECourse.Basic>

  getExistingProfessorsById(numbers: number[]): Promise<EProfessor.Basic[]>

  createProfessor(derivedProfessor: ProfessorInfo): Promise<EProfessor.Basic>

  updateProfessor(id: number, derivedProfessor: ProfessorInfo): Promise<EProfessor.Basic>

  getExistingDetailedLectures(param: { year: number, semester: number }): Promise<ELecture.Details[]>

  updateLecture(id: number, derivedLecture: LectureInfo): Promise<ELecture.Basic>

  createLecture(derivedLecture: LectureInfo): Promise<ELecture.Basic>

  updateLectureProfessors(id: number, { added, removed }: { added: number[], removed: number[] }): Promise<void>

  markLecturesDeleted(numbers: number[]): Promise<void>

  updateLectureExamtimes(id: number, { added, removed }: { added: ExamtimeInfo[], removed: number[] }): Promise<void>

  updateLectureClasstimes(id: number, { added, removed }: { added: ClassTimeInfo[], removed: number[] }): Promise<void>

  getUser(id: number): Promise<EUser.Basic | null>

  getExistingTakenLecturesByStudentId(
    year: number,
    semester: number,
    studentId: number,
  ): Promise<ELecture.Basic[] | null>

  replaceRawTakenLectures(
    data: { studentId: number, lectureId: number }[],
    { year, semester }: { year: number, semester: number },
  ): Promise<void>

  deleteTakenLecture(dataToDelete: { userprofile_id: number, lecture_id: number }): Promise<void>
  createTakenLecture(dataToCreate: { userprofile_id: number, lecture_id: number }): Promise<void>
}
