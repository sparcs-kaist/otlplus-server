export * from './pagination'
export * from './query'

export interface reCalcScoreReturn {
  reviewNum: number
  totalWeight: number
  sums: {
    gradeSum: number
    loadSum: number
    speechSum: number
  }
  avgs: {
    grade: number
    load: number
    speech: number
  }
}

export const FeedVisibleRate = {
  FamousHumanityReview: 0.5,
  FamousMajorReview: 0.6,
  ReviewWrite: 0.6,
  RelatedCourse: 0.45,
  RankedReview: 0.15,
  Rate: 0.25,
}
export type FeedVisibleRate = Union<typeof FeedVisibleRate>

export const FeedRateMinDays = 3
export const STAFF_ID = 830
type ValueType = string | number | boolean

export type Union<T extends { [key: string]: ValueType } | ReadonlyArray<ValueType>> =
  T extends ReadonlyArray<ValueType> ? T[number] : T extends { [key: string]: infer U } ? U : never
