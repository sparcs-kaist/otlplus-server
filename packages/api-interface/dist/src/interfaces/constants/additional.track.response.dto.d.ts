declare const types: readonly ['DOUBLE', 'MINOR', 'ADVANCED', 'INTERDISCIPLINARY'];
export type AdditionalTrackType = (typeof types)[number];
export declare const AddtionalTrackTypeNarrower: (
  value: unknown,
) => Error | 'DOUBLE' | 'MINOR' | 'ADVANCED' | 'INTERDISCIPLINARY';
export {};
