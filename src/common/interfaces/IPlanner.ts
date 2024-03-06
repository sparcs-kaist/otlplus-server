import { PlannerItemType } from './constants/planner';
import { ICourse } from './ICourse';
import { ILecture } from './ILecture';
import { IDepartment } from './IDepartment';

export namespace IPlanner {
  export namespace IItem {
    export interface Basic {
      id: number;
      item_type: PlannerItemType;
      is_excluded: boolean;
    }

    export interface Future extends Basic {
      year: number;
      semseter: number;
      course: ICourse.Response;
    }

    export interface Taken extends Basic {
      lecture: ILecture.Response;
      course: ICourse.Response;
    }

    export interface Arbitrary extends Basic {
      year: number;
      semester: number;
      department: IDepartment.Basic;
      type: string;
      type_en: string;
      credit: number;
      credit_au: number;
    }
  }
}
