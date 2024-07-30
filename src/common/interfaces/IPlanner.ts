import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  OrderDefaultValidator,
  _PROHIBITED_FIELD_PATTERN,
} from '../decorators/validators.decorator';
import { ICourse } from './ICourse';
import { IDepartment } from './IDepartment';
import { ILecture } from './ILecture';
import { PlannerItemType, PlannerItemTypeEnum } from './constants/planner';

export namespace IPlanner {
  export class Query {
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

  export class Body {
    @IsInt()
    start_year!: number;
    @IsInt()
    end_year!: number;
    @IsInt()
    general_track!: number;
    @IsInt()
    major_track!: number;
    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    additional_tracks?: number[];
    @IsOptional()
    @IsBoolean()
    should_update_taken_semesters?: boolean;
    @IsArray()
    @IsInt({ each: true })
    taken_items_to_copy!: number[];
    @IsArray()
    @IsInt({ each: true })
    future_items_to_copy!: number[];
    @IsArray()
    @IsInt({ each: true })
    arbitrary_items_to_copy!: number[];
  }

  export class RemoveItemBody {
    @IsInt()
    item!: number;
    @IsEnum(['TAKEN', 'FUTURE', 'ARBITRARY'])
    item_type!: 'TAKEN' | 'FUTURE' | 'ARBITRARY';
  }

  export class ReorderBody {
    @IsInt()
    arrange_order!: number;
  }

  export class UpdateItemBody {
    @IsInt()
    item!: number;

    @IsEnum(PlannerItemType)
    item_type!: PlannerItemType;

    @IsInt()
    @IsOptional()
    semester?: number;

    @IsBoolean()
    @IsOptional()
    is_excluded?: boolean;
  }

  export interface ArbitraryPlannerItemResponseDto {
    id: number;
    item_type: 'ARBITRARY';
    is_excluded: boolean;
    year: number;
    semester: number;
    department: IDepartment.Basic | null;
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
      course: ICourse.Basic;
    }

    export interface Taken extends Basic {
      lecture: ILecture.Basic;
      course: ICourse.Basic;
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
