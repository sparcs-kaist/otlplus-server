type ValueType = string | number | boolean;

export type Union<T extends { [key: string]: ValueType } | ReadonlyArray<ValueType>> =
  T extends ReadonlyArray<ValueType> ? T[number] : T extends { [key: string]: infer U } ? U : never;

export function generationUnionTypeChecker<UnionType extends string>(...values: UnionType[]) {
  return function (value: unknown): UnionType | Error {
    if (typeof value !== 'string') return new Error('Invalid value: ' + value);
    return values.includes(value as UnionType) ? (value as UnionType) : new Error('Invalid value: ' + value);
  };
}
