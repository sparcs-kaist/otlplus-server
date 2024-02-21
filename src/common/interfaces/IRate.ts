import { Type } from 'class-transformer';
import { IsNumber, Max, Min } from 'class-validator';

export interface IRate extends IRate.IBasic {}

export namespace IRate {
  export interface IBasic {
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
