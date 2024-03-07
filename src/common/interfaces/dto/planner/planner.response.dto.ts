import { ArbitraryPlannerItemResponseDto } from '../planner_item/arbitrary.response.dto';
import { FuturePlannerItemResponseDto } from '../planner_item/future.reponse.dto';
import { TakenPlannerItemResponseDto } from '../planner_item/taken.response.dto';
import { AdditionalTrackResponseDto } from '../track/additional.response.dto';
import { GeneralTrackResponseDto } from '../track/general.response.dto';
import { MajorTrackResponseDto } from '../track/major.response.dto';
import { IPlanner } from '../../IPlanner';

export interface PlannerResponseDto {
  id: number;
  start_year: number;
  end_year: number;
  general_track: GeneralTrackResponseDto;
  major_track: MajorTrackResponseDto;
  additional_tracks: AdditionalTrackResponseDto[];
  taken_items: IPlanner.IItem.Taken[];
  future_items: IPlanner.IItem.Future[];
  arbitrary_items: IPlanner.IItem.Arbitrary[];
  arrange_order: number;
}

export interface PlannerItemResponseDto {}
