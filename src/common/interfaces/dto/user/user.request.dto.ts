import { IsArray, IsOptional, Validate } from "class-validator";
import { OrderDefaultValidator } from "../reviews/validators";

export class UserTakenCoursesQueryDto {
  @IsOptional()
  @IsArray()
  @Validate(OrderDefaultValidator)
  order?: string[];
}
