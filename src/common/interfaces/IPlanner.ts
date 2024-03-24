import { Type } from 'class-transformer';
import { IsIn, IsInt, IsString } from 'class-validator';
import { DepartmentResponseDto } from './dto/department/department.response.dto';

export namespace IPlanner {
  export interface ArbitraryPlannerItemResponseDto {
    id: number;
    item_type: 'ARBITRARY';
    is_excluded: boolean;
    year: number;
    semester: number;
    department: DepartmentResponseDto | null;
    type: string;
    type_en: string;
    credit: number;
    credit_au: number;
  }

  export class AddArbitraryItemDto {
    // year, semester, department, type, type_en, credit, credit_au

    @IsInt()
    @Type(() => Number)
    year!: number;

    @IsIn([1, 2, 3, 4])
    @Type(() => Number)
    semester!: 1 | 2 | 3 | 4;

    @IsInt()
    @Type(() => Number)
    department!: number;

    @IsString()
    type!: string;

    @IsString()
    type_en!: string;

    @IsInt()
    @Type(() => Number)
    credit!: number;

    @IsInt()
    @Type(() => Number)
    credit_au!: number;
  }
}
