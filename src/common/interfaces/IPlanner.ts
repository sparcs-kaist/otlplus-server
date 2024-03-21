import { IsNumber } from 'class-validator';

export namespace IPlanner {
  export class FuturePlannerItemDto {
    @IsNumber()
    courseId!: number;

    @IsNumber()
    year!: number;

    @IsNumber()
    semester!: number;
  }
}
