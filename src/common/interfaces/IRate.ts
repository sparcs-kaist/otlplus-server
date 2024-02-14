import { Type } from 'class-transformer';
import { IsNumber, Max, Min } from 'class-validator';

export interface IRate extends IRate.ICommon {}

export namespace IRate {
  export interface ICommon {
    id: number;
    user_id: number;
    score: number;
    version: string;
    created_datetime: Date | null;
  }

  export class CreateDto {
    @IsNumber()
    @Max(5)
    @Min(1)
    @Type(() => Number)
    score!: number;
  }
}
