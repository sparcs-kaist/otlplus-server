import { Union } from '../../utils/method.utils';

export const PlannerItemType = {
  Taken: 'TAKEN',
  Future: 'FUTURE',
  Arbitrary: 'ARBITRARY',
};
export type PlannerItemType = Union<typeof PlannerItemType>;
