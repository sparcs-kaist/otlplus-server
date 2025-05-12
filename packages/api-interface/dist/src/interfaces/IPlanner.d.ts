import { AdditionalTrackType } from '@otl/api-interface/src/interfaces/constants/additional.track.response.dto';
import { IDepartment } from '@otl/api-interface/src/interfaces/IDepartment';
import { PlannerItemType, PlannerItemTypeEnum } from '@otl/api-interface/src/interfaces/constants/planner';
import { ICourse } from '@otl/api-interface/src/interfaces/ICourse';
import { ILecture } from '@otl/api-interface/src/interfaces/ILecture';
export declare namespace IPlanner {
  namespace ITrack {
    interface Additional {
      id: number;
      start_year: number;
      end_year: number;
      type: AdditionalTrackType;
      department: IDepartment.Basic | null;
      major_required: number;
      major_elective: number;
    }
    interface General {
      id: number;
      start_year: number;
      end_year: number;
      is_foreign: boolean;
      total_credit: number;
      total_au: number;
      basic_required: number;
      basic_elective: number;
      thesis_study: number;
      thesis_study_doublemajor: number;
      general_required_credit: number;
      general_required_au: number;
      humanities: number;
      humanities_doublemajor: number;
    }
    interface Major {
      id: number;
      start_year: number;
      end_year: number;
      department: IDepartment.Basic;
      basic_elective_doublemajor: number;
      major_required: number;
      major_elective: number;
    }
  }
  namespace IItem {
    type IMutate<IT = PlannerItemType> = IT extends PlannerItemTypeEnum.Taken
      ? IPlanner.IItem.Taken
      : IT extends PlannerItemTypeEnum.Future
        ? IPlanner.IItem.Future
        : IT extends PlannerItemTypeEnum.Arbitrary
          ? IPlanner.IItem.Arbitrary
          : IPlanner.IItem.Taken | IPlanner.IItem.Future | IPlanner.IItem.Arbitrary;
    interface Basic {
      id: number;
      item_type: PlannerItemType;
      is_excluded: boolean;
    }
    interface Future extends Basic {
      item_type: 'FUTURE';
      year: number;
      semester: number;
      course: ICourse.Basic;
    }
    interface Taken extends Basic {
      item_type: 'TAKEN';
      lecture: ILecture.Basic;
      course: ICourse.Basic;
    }
    interface Arbitrary extends Basic {
      item_type: 'ARBITRARY';
      year: number;
      semester: number;
      department: IDepartment.Basic | null;
      type: string;
      type_en: string;
      credit: number;
      credit_au: number;
    }
  }
  interface Detail {
    id: number;
    start_year: number;
    end_year: number;
    general_track: ITrack.General;
    major_track: ITrack.Major;
    additional_tracks: ITrack.Additional[];
    taken_items: IItem.Taken[];
    future_items: IItem.Future[];
    arbitrary_items: IItem.Arbitrary[];
    arrange_order: number;
  }
  class QueryDto {
    order?: string[];
    offset?: number;
    limit?: number;
  }
  class CreateBodyDto {
    start_year: number;
    end_year: number;
    general_track: number;
    major_track: number;
    additional_tracks?: number[];
    should_update_taken_semesters?: boolean;
    taken_items_to_copy: number[];
    future_items_to_copy: number[];
    arbitrary_items_to_copy: number[];
  }
  class RemoveItemBodyDto {
    item: number;
    item_type: 'TAKEN' | 'FUTURE' | 'ARBITRARY';
  }
  class ReorderBodyDto {
    arrange_order: number;
  }
  class UpdateItemBodyDto {
    item: number;
    item_type: PlannerItemType;
    semester?: number;
    is_excluded?: boolean;
  }
  class FuturePlannerItemDto {
    course: number;
    year: number;
    semester: number;
  }
  class AddArbitraryItemDto {
    year: number;
    semester: 1 | 2 | 3 | 4;
    department: number;
    type: string;
    type_en: string;
    credit: number;
    credit_au: number;
  }
  class UpdateBodyDto {
    start_year: number;
    end_year: number;
    general_track: number;
    major_track: number;
    additional_tracks: number[];
    should_update_taken_semesters?: boolean;
  }
}
