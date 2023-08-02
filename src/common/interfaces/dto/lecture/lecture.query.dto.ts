export interface LectureQueryDTO {
  "year"?: number[];
  "semester"?: number[];
  "day"?: number[];
  "begin"?: number[];
  "end"?: number[];
  "department"?: string[];
  "type"?: string[];
  "level"?: string[];
  "group"?: string[]
  "keyword"?: string;
  "order"?: string[];
  "offset"?: number;
  "limit"?: number;
}