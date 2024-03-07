import { ICourse } from './ICourse';
import { ILecture } from './ILecture';
import { IDepartment } from './IDepartment';
import { PlannerItemType, PlannerItemTypeEnum } from './constants/planner';

export namespace IPlanner {
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
