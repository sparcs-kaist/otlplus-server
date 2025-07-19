export const SCHOLAR_MQ = Symbol('SCHOLAR_MQ')
export interface ScholarMQ {
  publishLectureTitleUpdate(lectureId: number): Promise<boolean>
}
