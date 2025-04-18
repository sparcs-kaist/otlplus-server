import { generationUnionTypeChecker } from '@otl/server-nest/common/interfaces/utils/util'

const types = ['DOUBLE', 'MINOR', 'ADVANCED', 'INTERDISCIPLINARY'] as const
export type AdditionalTrackType = (typeof types)[number]
export const AddtionalTrackTypeNarrower = generationUnionTypeChecker(...types)
