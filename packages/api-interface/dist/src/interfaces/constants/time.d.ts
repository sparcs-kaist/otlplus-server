export declare enum SemesterEnum {
  Spring = 1,
  Summer = 2,
  Fall = 3,
  Winter = 4,
}
export declare enum WeekdayEnum {
  Mon = 1,
  Tue = 2,
  Wed = 3,
  Thu = 4,
  Fri = 5,
  Sat = 6,
  Sun = 7,
}
export type TimeBlockDay = Date | WeekdayEnum;
export interface TimeBlock {
  day: TimeBlockDay;
  timeIndex: number;
  duration: number;
  startTime: string;
  endTime: string;
}
