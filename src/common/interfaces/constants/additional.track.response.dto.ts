import { generationUnionTypeChecker } from 'src/common/utils/method.utils';

const types = ['DOUBLE', 'MINOR', 'ADVANCED', 'INTERDISCIPLINARY'] as const;
export type AdditionalTrackType = (typeof types)[number];
export const AddtionalTrackTypeNarrower = generationUnionTypeChecker(...types);
