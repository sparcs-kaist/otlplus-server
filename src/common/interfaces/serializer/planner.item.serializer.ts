import {
  ArbitraryPlannerItem,
  FuturePlannerItem,
  TakenPlannerItem,
} from 'src/common/schemaTypes/types';
import { ArbitraryPlannerItemResponseDto } from '../dto/planner_item/arbitrary.response.dto';
import { FuturePlannerItemResponseDto } from '../dto/planner_item/future.reponse.dto';
import { TakenPlannerItemResponseDto } from '../dto/planner_item/taken.response.dto';
import { toJsonCourse } from './course.serializer';
import { toJsonDepartment } from './department.serializer';
import { toJsonLecture } from './lecture.serializer';
import { IPlanner } from '../IPlanner';
import { EPlanners } from '../../entities/EPlanners';

export const toJsonTakenItem = (
  taken_item: EPlanners.EItems.Taken.Details,
): IPlanner.IItem.Taken => {
  return {
    id: taken_item.id,
    item_type: 'TAKEN',
    is_excluded: taken_item.is_excluded,
    lecture: toJsonLecture(taken_item.subject_lecture, false),
    course: toJsonCourse(
      taken_item.subject_lecture.course,
      taken_item.subject_lecture,
      taken_item.subject_lecture.course.subject_course_professors.map(
        (x) => x.professor,
      ),
      false,
    ),
  };
};

export const toJsonArbitraryItem = (
  arbitrary_item: EPlanners.EItems.Arbitrary.Extended,
): IPlanner.IItem.Arbitrary => {
  return {
    id: arbitrary_item.id,
    item_type: 'ARBITRARY',
    is_excluded: arbitrary_item.is_excluded,
    year: arbitrary_item.year,
    semester: arbitrary_item.semester,
    department:
      arbitrary_item.subject_department !== null
        ? toJsonDepartment(arbitrary_item.subject_department)
        : null,
    type: arbitrary_item.type,
    type_en: arbitrary_item.type_en,
    credit: arbitrary_item.credit,
    credit_au: arbitrary_item.credit_au,
  };
};

export const toJsonFutureItem = (
  future_item: EPlanners.EItems.Future.Extended,
): IPlanner.IItem.Future => {
  return {
    id: future_item.id,
    item_type: 'FUTURE',
    is_excluded: future_item.is_excluded,
    year: future_item.year,
    semester: future_item.semester,
    course: toJsonCourse(
      future_item.subject_course,
      future_item.subject_course.lecture[0],
      future_item.subject_course.subject_course_professors.map(
        (x) => x.professor,
      ),
      false,
    ),
  };
};
