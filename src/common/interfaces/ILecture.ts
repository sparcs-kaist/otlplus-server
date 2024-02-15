import { Type } from 'class-transformer';
import { IsInt, IsString } from 'class-validator';

export namespace ILecture {
  export class AutocompleteDto {
    @IsInt()
    @Type(() => Number)
    year!: number;

    @IsInt()
    @Type(() => Number)
    semester!: number;

    @IsString()
    keyword!: string;
  }
}
