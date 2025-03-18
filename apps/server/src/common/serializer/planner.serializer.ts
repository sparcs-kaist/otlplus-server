import { EPlanners } from '@otl/api-interface/src/entities/EPlanners';
import { IPlanner } from '@otl/api-interface/src/interfaces/IPlanner';
import { toJsonArbitraryItem, toJsonFutureItem, toJsonTakenItem } from './planner.item.serializer';
import { toJsonAdditionalTrack, toJsonGeneralTrack, toJsonMajorTrack } from './track.serializer';

export const toJsonPlanner = (planner: EPlanners.Extended): IPlanner.Detail => {
  return {
    id: planner.id,
    start_year: planner.start_year,
    end_year: planner.end_year,
    general_track: toJsonGeneralTrack(planner.graduation_generaltrack),
    major_track: toJsonMajorTrack(planner.graduation_majortrack),
    additional_tracks: planner.planner_planner_additional_tracks.map((additional_track) =>
      toJsonAdditionalTrack(additional_track.graduation_additionaltrack),
    ),
    taken_items: planner.planner_takenplanneritem.map((item) => toJsonTakenItem(item)),
    future_items: planner.planner_futureplanneritem.map((item) => toJsonFutureItem(item)),
    arbitrary_items: planner.planner_arbitraryplanneritem.map((item) => toJsonArbitraryItem(item)),
    arrange_order: planner.arrange_order,
  };
};
