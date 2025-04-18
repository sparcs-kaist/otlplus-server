import { Union } from '@otl/common/utils'

export const PlannerItemType = {
  Taken: 'TAKEN',
  Future: 'FUTURE',
  Arbitrary: 'ARBITRARY',
}
export type PlannerItemType = Union<typeof PlannerItemType>

export enum PlannerItemTypeEnum {
  Taken = 'TAKEN',
  Future = 'FUTURE',
  Arbitrary = 'ARBITRARY',
}
