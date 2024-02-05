import { IsDateString } from 'class-validator';
import { ICourse } from '../course/ICourse';
import { DepartmentResponseDto } from '../department/department.response.dto';
import { NestedLectureResponseDto } from '../lecture/lecture.response.dto';
import { ReviewResponseDto } from '../reviews/review.response.dto';

export namespace IFeed {
  export interface IBasic {
    type: string;
    date: Date;
    priority: number;
    reviews?: ReviewResponseDto[];
    department?: DepartmentResponseDto;
    lecture?: NestedLectureResponseDto;
    course?: ICourse.IBasic;
  }

  export class QueryDto {
    @IsDateString()
    date!: string;
  }
}
