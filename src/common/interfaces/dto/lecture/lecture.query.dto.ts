export interface LectureQueryDTO {
  "year"?: number[];
  "semester"?: number[];
  "day"?: number[];
  "begin"?: number[];
  "end"?: number[];
  "department"?: string[];
  "type"?: string[];
  "level"?: "1"|"2"|"3"|"4"[]
  "group"?: string[]
  "keyword"?: string;
  "order"?: string[];
  "offset"?: number;
  "limit"?: number;
}