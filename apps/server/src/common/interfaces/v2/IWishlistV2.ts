import { Type } from 'class-transformer'
import { IsNumber } from 'class-validator'

import { ILectureV2 } from './ILectureV2'

export namespace IWishlistV2 {
  export interface WithLectures {
    lectures: ILectureV2.Basic[]
  }

  export class AddLectureDto {
    @IsNumber()
    @Type(() => Number)
    lecture!: number
  }

  export class RemoveLectureDto {
    @IsNumber()
    @Type(() => Number)
    lecture!: number
  }
}
