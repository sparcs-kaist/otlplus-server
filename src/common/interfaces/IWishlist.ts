import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { ILecture } from './ILecture';

export namespace IWishlist {
  export interface WithLectures {
    lectures: ILecture.Basic[];
  }

  export class AddLectureDto {
    @IsNumber()
    @Type(() => Number)
    lecture!: number;
  }

  export class RemoveLectureDto {
    @IsNumber()
    @Type(() => Number)
    lecture!: number;
  }
}
