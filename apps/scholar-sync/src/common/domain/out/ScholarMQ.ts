import { IScholar } from '@otl/scholar-sync/clients/scholar/IScholar'

export const SCHOLAR_MQ = Symbol('SCHOLAR_MQ')
export interface ScholarMQ {
  publishLectureTitleUpdate(lectureId: number, courseId: number): Promise<boolean>

  publishRepresentativeLectureUpdate(courseId: number, lectureId: number | null): Promise<boolean>

  publishIndividualTakenLectureUpdate(
    year: number,
    semester: number,
    studentNo: number,
    userId: number,
    requestId: string,
    lectureData: IScholar.ScholarDBBody,
    classtimeData: IScholar.ClasstimeBody,
    examTimeData: IScholar.ExamtimeBody,
    takenLectureData: IScholar.TakenLectureBody,
  ): Promise<boolean>
}
