export const PlannerItemType = {
  Taken: 'TAKEN',
  Future: 'FUTURE',
  Arbitrary: 'ARBITRARY',
}
export type PlannerItemType = (typeof PlannerItemType)[keyof typeof PlannerItemType]

// export type PlannerItemType = Union<typeof PlannerItemType>

export enum PlannerItemTypeEnum {
  Taken = 'TAKEN',
  Future = 'FUTURE',
  Arbitrary = 'ARBITRARY',
}
