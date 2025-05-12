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

export type TimeBlockDay = Date | WeekdayEnum;

export interface TimeBlock {
  //
  day: TimeBlockDay;
  timeIndex: number; // 0~
  duration: number; // 30분 단위 몇개인지
  startTime: string; // ("HH:MM, 8:00~29:30"), 8+timeindex / 2 : timeIndex%2 * 30
  endTime: string; // ("HH:MM, 8:30~30:00"), 8 + ( timeIndex + duration ) / 2 : (timeIndex + duration)%2 * 30
}
