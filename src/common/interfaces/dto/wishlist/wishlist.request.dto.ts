import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class WishlistAddLectureDto {
  @IsNumber()
  @Type(() => Number)
  lecture!: number;
}
