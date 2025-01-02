export function normalizeArray<T>(
  arr: T[],
  selector: (item: T) => string | number | symbol | null = (item: any) =>
    item.id,
  defaultObj?: { [key: string]: T | undefined },
): { [key: string | number | symbol]: T | undefined } {
  const normalizeObj: { [key: string | number | symbol]: T | undefined } =
    defaultObj || {};

  arr.forEach((data) => {
    const key = selector(data);
    if (key !== null) normalizeObj[key] = data;
  });

  return normalizeObj;
}

export function groupBy<T, K extends keyof any>(
  arr: T[],
  selector: (i: T) => K,
): Record<K, T[] | undefined> {
  return arr.reduce(
    (groups: Record<K, T[] | undefined>, item) => {
      (groups[selector(item)] ??= []).push(item);
      return groups;
    },
    {} as Record<K, T[] | undefined>,
  );
}

type ValueType = string | number | boolean;

export type Union<
  T extends { [key: string]: ValueType } | ReadonlyArray<ValueType>,
> =
  T extends ReadonlyArray<ValueType>
    ? T[number]
    : T extends { [key: string]: infer U }
      ? U
      : never;

export function getRandomChoice<T>(choices: T[]): T {
  const randomIndex = Math.floor(Math.random() * choices.length);
  return choices[randomIndex];
}

export function generationUnionTypeChecker<UnionType extends string>(
  ...values: UnionType[]
) {
  return function (value: unknown): UnionType | Error {
    if (typeof value !== 'string') return new Error('Invalid value: ' + value);
    return values.includes(value as UnionType)
      ? (value as UnionType)
      : new Error('Invalid value: ' + value);
  };
}
