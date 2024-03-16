import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export namespace IShare {
  export class ParamsStructureDto {
    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    lecture_year!: number;

    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    year!: number;

    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    semester!: number;

    @IsOptional()
    @IsString()
    language?: string;
  }
}
