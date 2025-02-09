import { Transform, Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { _PROHIBITED_FIELD_PATTERN, OrderDefaultValidator } from '@otl/api-interface/src/interfaces/validators.decorator';
import { ILecture } from '@otl/api-interface/src/interfaces/ILecture';


export const TIMETABLE_MAX_LIMIT = 50;

export namespace ITimetable {
  export interface IClasstime {
    id: number;
    day: number;
    begin: Date;
    end: Date;
    type: string;
    building_id: string | null;
    building_full_name: string | null;
    building_full_name_en: string | null;
    room_name: string | null;
    unit_time: number | null;
    lecture_id: number | null;
  }

  export interface Response {
    id: number;
    lectures: ILecture.Detail[] | null | undefined;
    arrange_order: number;
  }

  export class QueryDto {
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    year?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    semester?: number;

    @OrderDefaultValidator(_PROHIBITED_FIELD_PATTERN)
    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
    @IsArray()
    @IsString({ each: true })
    order?: string[];

    @IsOptional()
    @Transform(({ value }) => value ?? 0)
    @IsNumber()
    offset?: number;

    @IsOptional()
    @Transform(({ value }) => value ?? TIMETABLE_MAX_LIMIT)
    @IsNumber()
    limit?: number;
  }

  export class CreateDto {
    @IsNumber()
    year!: number;

    @IsNumber()
    semester!: number;

    @IsArray()
    @IsNumber({}, { each: true })
    lectures!: number[];
  }

  export class AddLectureDto {
    @IsNumber()
    @Type(() => Number)
    lecture!: number;
  }

  export class ReorderTimetableDto {
    @IsNumber()
    @Type(() => Number)
    arrange_order!: number;
  }
}
