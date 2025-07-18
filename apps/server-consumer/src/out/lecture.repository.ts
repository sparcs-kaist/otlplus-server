import { Lecture, LectureBasic } from '@otl/server-nest/modules/lectures/domain/lecture'

export const LECTURE_REPOSITORY = Symbol('LECTURE_REPOSITORY')

export interface ServerConsumerLectureRepository {
  getLectureById(lectureId: number): Promise<Lecture>
  getRelatedLectureById(lectureId: number): Promise<Lecture[]>
  updateLectureTitle(lectures: LectureBasic[], commonTitle: string, isEnglish: boolean): Promise<boolean>
}
