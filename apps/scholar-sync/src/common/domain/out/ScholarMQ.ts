export const SCHOLAR_MQ = Symbol('SCHOLAR_MQ')
export interface ScholarMQ {
  publishLectureTitleUpdate(lectureId: number, courseId: number): Promise<boolean>

  publishRepresentativeLectureUpdate(courseId: number, lectureId: number | null): Promise<boolean>
}
