import { BadRequestException } from '@nestjs/common'
import { IPlanner } from '@otl/server-nest/common/interfaces'

import { PlannerItemType } from '@otl/common/enum/planner'

import { EPlanners } from '@otl/prisma-client/entities'

import { toJsonCourseDetail } from './course.serializer'
import { toJsonDepartment } from './department.serializer'
import { toJsonLectureDetail } from './lecture.serializer'

// export function toJsonPlannerItem<IT extends PlannerItemType>(
//   item: EPlanners.EItems.Taken.Details | EPlanners.EItems.Future.Extended | EPlanners.EItems.Arbitrary.Extended,
//   item_type: IT,
// ): IPlanner.IItem.IMutate {
//   if (item_type === PlannerItemType.Taken) {
//     return toJsonTakenItem(item as EPlanners.EItems.Taken.Details);
//   } else if (item_type === PlannerItemType.Future) {
//     return toJsonFutureItem(item as EPlanners.EItems.Future.Extended);
//   } else if (item_type === PlannerItemType.Arbitrary) {
//     return toJsonArbitraryItem(item as EPlanners.EItems.Arbitrary.Extended);
//   } else {
//     throw new BadRequestException('Invalid Planner Item Type');
//   }
// }

export const toJsonTakenItem = (taken_item: EPlanners.EItems.Taken.Details): IPlanner.IItem.Taken => ({
  id: taken_item.id,
  item_type: 'TAKEN',
  is_excluded: taken_item.is_excluded,
  lecture: toJsonLectureDetail(taken_item.subject_lecture),
  course: toJsonCourseDetail(
    taken_item.subject_lecture.course,
    taken_item.subject_lecture,
    taken_item.subject_lecture.course.subject_course_professors.map((x: { professor: any }) => x.professor),
  ),
})

export const toJsonArbitraryItem = (arbitrary_item: EPlanners.EItems.Arbitrary.Extended): IPlanner.IItem.Arbitrary => ({
  id: arbitrary_item.id,
  item_type: 'ARBITRARY',
  is_excluded: arbitrary_item.is_excluded,
  year: arbitrary_item.year,
  semester: arbitrary_item.semester,
  department: arbitrary_item.subject_department !== null ? toJsonDepartment(arbitrary_item.subject_department) : null,
  type: arbitrary_item.type,
  type_en: arbitrary_item.type_en,
  credit: arbitrary_item.credit,
  credit_au: arbitrary_item.credit_au,
})

export const toJsonFutureItem = (future_item: EPlanners.EItems.Future.Extended): IPlanner.IItem.Future => ({
  id: future_item.id,
  item_type: 'FUTURE',
  is_excluded: future_item.is_excluded,
  year: future_item.year,
  semester: future_item.semester,
  course: toJsonCourseDetail(
    future_item.subject_course,
    future_item.subject_course.lecture[0],
    future_item.subject_course.subject_course_professors.map((x) => x.professor),
  ),
})

export function toJsonPlannerItem<IT extends PlannerItemType>(
  item: EPlanners.EItems.Taken.Details | EPlanners.EItems.Future.Extended | EPlanners.EItems.Arbitrary.Extended,
  item_type: IT,
): IPlanner.IItem.IMutate {
  const handlers = {
    [PlannerItemType.Taken]: (e: EPlanners.EItems.Taken.Details) => toJsonTakenItem(e),
    [PlannerItemType.Future]: (e: EPlanners.EItems.Future.Extended) => toJsonFutureItem(e),
    [PlannerItemType.Arbitrary]: (e: EPlanners.EItems.Arbitrary.Extended) => toJsonArbitraryItem(e),
  } satisfies Record<PlannerItemType, (e: any) => IPlanner.IItem.IMutate>

  const handler = handlers[item_type]
  if (handler) {
    return handler(item as any)
  }

  throw new BadRequestException('Invalid Planner Item Type')
}
