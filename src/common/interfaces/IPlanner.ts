import { ICourse } from './ICourse';
import { ILecture } from './ILecture';
import { IDepartment } from './IDepartment';
import { PlannerItemType, PlannerItemTypeEnum } from './constants/planner';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNumber, IsString } from 'class-validator';
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

  export class FuturePlannerItemDto {
    @IsInt()
    @Type(() => Number)
    course!: number;

    @IsInt()
    @Type(() => Number)
    year!: number;

    @IsIn([1, 2, 3, 4])
    @Type(() => Number)
    semester!: number;
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
  export namespace IItem {
    export type IMutate<IT = PlannerItemType> =
      IT extends PlannerItemTypeEnum.Taken
        ? IPlanner.IItem.Taken
        : IT extends PlannerItemTypeEnum.Future
        ? IPlanner.IItem.Future
        : IT extends PlannerItemTypeEnum.Arbitrary
        ? IPlanner.IItem.Arbitrary
        :
            | IPlanner.IItem.Taken
            | IPlanner.IItem.Future
            | IPlanner.IItem.Arbitrary;

    export interface Basic {
      id: number;
      item_type: PlannerItemType;
      is_excluded: boolean;
    }

    export interface Future extends Basic {
      year: number;
      semester: number;
      course: ICourse.Response;
    }

    export interface Taken extends Basic {
      lecture: ILecture.Response;
      course: ICourse.Response;
    }

    export interface Arbitrary extends Basic {
      year: number;
      semester: number;
      department: IDepartment.Basic | null;
      type: string;
      type_en: string;
      credit: number;
      credit_au: number;
    }
  }
}
