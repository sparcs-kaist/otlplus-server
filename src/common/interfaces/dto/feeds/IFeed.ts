import { IsDateString } from 'class-validator';
import { DepartmentResponseDto } from '../department/department.response.dto';
import { ReviewResponseDto } from '../reviews/review.response.dto';

export namespace IFeed {
  export interface IBasic {
    type: string;
    date: Date;
    priority: number;
    reviews?: ReviewResponseDto[];
    department?: DepartmentResponseDto;
  }

  export class QueryDto {
    @IsDateString()
    date!: string;
  }
}
