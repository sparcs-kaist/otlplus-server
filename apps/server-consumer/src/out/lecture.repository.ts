import { Lecture, LectureBasic, LectureScore } from '@otl/server-nest/modules/lectures/domain/lecture'

export const LECTURE_REPOSITORY = Symbol('LECTURE_REPOSITORY')

export interface ServerConsumerLectureRepository {
  getLectureById(lectureId: number): Promise<Lecture>
  getRelatedLectureById(lectureId: number): Promise<Lecture[]>
  updateLectureTitle(lectures: LectureBasic[], commonTitle: string, isEnglish: boolean): Promise<boolean>

  updateLectureScore(id: number, grades: LectureScore): Promise<LectureBasic>
}
