import { CanvasRenderingContext2D } from 'canvas';
import { ILecture } from '@otl/api-interface/src';
export declare namespace IShare {
  interface RoundedRectangleOptions {
    ctx: CanvasRenderingContext2D;
    x: number;
    y: number;
    width: number;
    height: number;
    radius: number;
    color: string;
  }
  interface TextOptions {
    ctx: CanvasRenderingContext2D;
    x: number;
    y: number;
    text: string;
    font: string;
    fontSize: number;
    color: string;
    align?: 'right' | 'left' | 'center';
  }
  interface DrawTileOptions {
    ctx: CanvasRenderingContext2D;
    x: number;
    y: number;
    width: number;
    height: number;
    title: string;
    professor: string;
    location: string;
    font: string;
    fontSize: number;
  }
  interface drawTimetableDatas {
    lectures: ILecture.UserTaken[];
    timetableType: string;
    semesterName: string;
    isEnglish: boolean;
    semesterFontSize: number;
    tileFontSize: number;
  }
  class TimetableImageQueryDto {
    timetable: number;
    year: number;
    semester: number;
    language?: string;
  }
  class TimetableIcalQueryDto {
    timetable: number;
    year: number;
    semester: number;
    language?: string;
  }
}
