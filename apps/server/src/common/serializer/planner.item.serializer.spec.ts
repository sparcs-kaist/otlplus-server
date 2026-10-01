import { PlannerItemType } from '@otl/common/enum/planner'
import { EPlanners } from '@otl/prisma-client/entities'

import { toJsonPlannerItem } from './planner.item.serializer'

it('dispatches by item shape without casting unrelated planner variants', () => {
  const item: EPlanners.EItems.Arbitrary.Extended = {
    id: 1, planner_id: 2, is_excluded: false, year: 2026, semester: 1,
    department_id: null, subject_department: null, type: '기타', type_en: 'Other', credit: 3, credit_au: 0,
  }
  expect(toJsonPlannerItem(item, PlannerItemType.Arbitrary)).toEqual({
    id: 1, item_type: 'ARBITRARY', is_excluded: false, year: 2026, semester: 1,
    department: null, type: '기타', type_en: 'Other', credit: 3, credit_au: 0,
  })
  expect(() => toJsonPlannerItem(item, PlannerItemType.Taken)).toThrow('Invalid Planner Item Type')
  expect(() => toJsonPlannerItem(item, PlannerItemType.Future)).toThrow('Invalid Planner Item Type')
})
