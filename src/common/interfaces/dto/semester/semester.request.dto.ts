import { IsArray, IsOptional, Validate } from "class-validator";
import { _PROHIBITED_FIELD_PATTERN, OrderDefaultValidator } from "../../../decorators/validators.decorator";


export class SemesterQueryDto{
  @IsOptional()
  @IsArray()
  @OrderDefaultValidator(_PROHIBITED_FIELD_PATTERN)
  order?: string[];
}