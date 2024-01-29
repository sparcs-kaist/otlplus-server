import { IsDate } from 'class-validator';

export namespace IFeed {
  export class QueryDto {
    @IsDate()
    date!: Date;
  }
}
