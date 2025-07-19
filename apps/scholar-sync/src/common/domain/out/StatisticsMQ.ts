export const STATISTICS_MQ = Symbol('STATISTICS_MQ')
export interface SyncServerStatisticsMQ {
  publishLectureScoreUpdate(lectureId: number): Promise<boolean>
}
