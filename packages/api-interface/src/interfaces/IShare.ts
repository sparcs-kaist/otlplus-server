import { CanvasRenderingContext2D } from 'canvas';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ILecture } from '@otl/api-interface/src';

export namespace IShare {
  export interface RoundedRectangleOptions {
    ctx: CanvasRenderingContext2D;
    x: number;
    y: number;
    width: number;
    height: number;
    radius: number;
    color: string;
  }

  export interface TextOptions {
    ctx: CanvasRenderingContext2D;
    x: number;
    y: number;
    text: string;
    font: string;
    fontSize: number;
    color: string;
    align?: 'right' | 'left' | 'center'; // Optional parameter
  }

  export interface DrawTileOptions {
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

  export interface drawTimetableDatas {
    lectures: ILecture.UserTaken[];
    timetableType: string;
    semesterName: string;
    isEnglish: boolean;
    semesterFontSize: number;
    tileFontSize: number;
  }

  export class TimetableImageQueryDto {
    @Type(() => Number)
    @IsNumber()
    timetable!: number;

    @Type(() => Number)
    @IsNumber()
    year!: number;

    @Type(() => Number)
    @IsNumber()
    semester!: number;

    @IsString()
    @IsOptional()
    language?: string;
  }

  export class TimetableIcalQueryDto {
    @Type(() => Number)
    @IsNumber()
    timetable!: number;

    @Type(() => Number)
    @IsNumber()
    year!: number;

    @Type(() => Number)
    @IsNumber()
    semester!: number;

    @IsString()
    @IsOptional()
    language?: string;
  }
}
