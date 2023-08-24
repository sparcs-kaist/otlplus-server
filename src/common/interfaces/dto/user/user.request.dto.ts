import { Transform } from "class-transformer";
import { IsArray, IsOptional, IsString, Validate } from "class-validator";
import { OrderDefaultValidator, _PROHIBITED_FIELD_PATTERN } from "src/common/decorators/request-ordervalidator.decorator";

export class UserTakenCoursesQueryDto {
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  @IsArray()
  @IsString({ each: true })
  @OrderDefaultValidator(_PROHIBITED_FIELD_PATTERN)
  order?: string[];
}
