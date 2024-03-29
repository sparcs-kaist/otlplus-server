import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  Validate,
} from 'class-validator';
import {
  OrderDefaultValidator,
  StringStripLength,
  _PROHIBITED_FIELD_PATTERN,
} from '../../../decorators/validators.decorator';
export class ReviewQueryDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  lecture_year?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  lecture_semester?: number;

  @IsOptional()
  @IsString()
  response_type?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  @IsArray()
  @IsString({ each: true })
  @OrderDefaultValidator(_PROHIBITED_FIELD_PATTERN)
  order?: string[];

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  offset?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;
}

export class ReviewCreateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Validate(StringStripLength)
  content!: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  lecture!: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  grade!: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  load!: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  speech!: number;
}

export class ReviewUpdateDto extends PartialType(
  OmitType(ReviewCreateDto, ['lecture']),
) {}
