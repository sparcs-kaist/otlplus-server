import { IsArray, IsOptional, Validate } from 'class-validator';
import { OrderDefaultValidator } from '../../../decorators/validators.decorator';

export class UserTakenCoursesQueryDto {
  @IsOptional()
  @IsArray()
  @Validate(OrderDefaultValidator)
  order?: string[];
}
