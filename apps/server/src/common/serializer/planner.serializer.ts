import { IPlanner } from '@otl/server-nest/common/interfaces'

import { ELecture } from '@otl/prisma-client'
import { EPlanners } from '@otl/prisma-client/entities/EPlanners'

import { toJsonArbitraryItem, toJsonFutureItem, toJsonTakenItem } from './planner.item.serializer'
import { toJsonAdditionalTrack, toJsonGeneralTrack, toJsonMajorTrack } from './track.serializer'

export const toJsonPlanner = (planner: EPlanners.Basic): IPlanner.Response => ({
  id: planner.id,
  start_year: planner.start_year,
  end_year: planner.end_year,
  general_track: null,
  major_track: null,
  additional_tracks: null,
  taken_items: null,
  future_items: null,
  arbitrary_items: null,
  arrange_order: planner.arrange_order,
})

export const toJsonPlannerDetails = (
  planner: EPlanners.Details,
  futureItemsRepresentativeLectureMap: Map<number | undefined, ELecture.Basic>,
): IPlanner.Detail => ({
  id: planner.id,
  start_year: planner.start_year,
  end_year: planner.end_year,
  general_track: toJsonGeneralTrack(planner.graduation_generaltrack),
  major_track: toJsonMajorTrack(planner.graduation_majortrack),
  additional_tracks: planner.planner_planner_additional_tracks.map((additional_track) => toJsonAdditionalTrack(additional_track.graduation_additionaltrack)),
  taken_items: planner.planner_takenplanneritem.map((item) => toJsonTakenItem(item)),
  future_items: planner.planner_futureplanneritem.map((item) => toJsonFutureItem(item, futureItemsRepresentativeLectureMap.get(item.course_id) as ELecture.Basic)),
  arbitrary_items: planner.planner_arbitraryplanneritem.map((item) => toJsonArbitraryItem(item)),
  arrange_order: planner.arrange_order,
})
