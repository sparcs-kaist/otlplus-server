import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { ILecture } from '@otl/api-interface/src/interfaces';

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
