import { generationUnionTypeChecker } from '@otl/api-interface/src/interfaces/utils/util';


const types = ['DOUBLE', 'MINOR', 'ADVANCED', 'INTERDISCIPLINARY'] as const;
export type AdditionalTrackType = (typeof types)[number];
export const AddtionalTrackTypeNarrower = generationUnionTypeChecker(...types);
