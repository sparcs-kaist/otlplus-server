export const RedisTTL = {
  DAY: 3600 * 24 * 1000,
  WEEK: 3600 * 24 * 7 * 1000,
  HOUR: 3600 * 1000,
  HALF_HOUR: 1800 * 1000,
  MIN: 60 * 1000,
} as const
export type TTL = (typeof RedisTTL)[keyof typeof RedisTTL]

export enum SemesterEnum {
  Spring = 1,
  Summer,
  Fall,
  Winter,
}

export enum WeekdayEnum {
  Mon = 1,
  Tue,
  Wed,
  Thu,
  Fri,
  Sat,
  Sun,
}

export type TimeBlockDay = Date | WeekdayEnum

export interface TimeBlock {
  //
  day: TimeBlockDay
  timeIndex: number // 0~
  startTime: string // ("HH:MM, 8:00~29:30"), 8+timeindex / 2 : timeIndex%2 * 30
  endTime: string // ("HH:MM, 8:30~30:00")
}
