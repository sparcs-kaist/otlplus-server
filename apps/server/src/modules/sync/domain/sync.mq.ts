export const TakenLectureMQ = Symbol('SCHOLAR_MQ')
export interface TakenLectureMQ {
  publishLectureTitleUpdate(lectureId: number, courseId: number): Promise<boolean>

  publishRepresentativeLectureUpdate(courseId: number, lectureId: number | null): Promise<boolean>

  publishTakenLectureSyncRequest(requestId: string, userId: number, year: number, semester: number): Promise<boolean>
}
