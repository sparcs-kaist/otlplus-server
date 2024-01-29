import { IsDateString } from 'class-validator';
import { ReviewResponseDto } from '../reviews/review.response.dto';

export namespace IFeed {
  export interface ICommon {
    type: string;
    date: Date;
    priority: number;
    reviews?: ReviewResponseDto;
  }

  export class QueryDto {
    @IsDateString()
    date!: string;
  }
}
