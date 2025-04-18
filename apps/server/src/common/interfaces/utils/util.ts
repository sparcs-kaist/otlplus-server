export function generationUnionTypeChecker<UnionType extends string>(...values: UnionType[]) {
  return function (value: unknown): UnionType | Error {
    if (typeof value !== 'string') return new Error('Invalid value: ' + value);
    return values.includes(value as UnionType) ? (value as UnionType) : new Error('Invalid value: ' + value);
  };
}
