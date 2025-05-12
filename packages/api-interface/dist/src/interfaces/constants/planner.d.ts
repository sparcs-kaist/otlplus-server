import { Union } from '@otl/api-interface/src/interfaces/utils/util';
export declare const PlannerItemType: {
  Taken: string;
  Future: string;
  Arbitrary: string;
};
export type PlannerItemType = Union<typeof PlannerItemType>;
export declare enum PlannerItemTypeEnum {
  Taken = 'TAKEN',
  Future = 'FUTURE',
  Arbitrary = 'ARBITRARY',
}
