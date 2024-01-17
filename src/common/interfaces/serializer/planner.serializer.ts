import { PlannerDetails } from 'src/common/schemaTypes/types';
import { PlannerResponseDto } from '../dto/planner/planner.response.dto';
import {
  toJsonAdditionalTrack,
  toJsonGeneralTrack,
  toJsonMajorTrack,
} from './track.serializer';

export const toJsonPlanner = (planner: PlannerDetails): PlannerResponseDto => {
  return {
    id: planner.id,
    start_year: planner.start_year,
    end_year: planner.end_year,
    general_track: toJsonGeneralTrack(planner.graduation_generaltrack),
    major_track: toJsonMajorTrack(planner.graduation_majortrack),
    additional_tracks: planner.planner_planner_additional_tracks.map(
      (additional_track) =>
        toJsonAdditionalTrack(additional_track.graduation_additionaltrack),
    ),
    taken_items: toJsonTakenItem(planner.taken_items),
    future_items: toJsonFutureItem(planner.future_items),
    arbitrary_items: toJsonArbitraryItem(planner.arbitrary_items),
    arrange_order: planner.arrange_order,
  };
};
