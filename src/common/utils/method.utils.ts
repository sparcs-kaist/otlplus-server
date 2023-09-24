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
  key: (i: T) => K,
): Record<K, T[]> {
  return arr.reduce((groups, item) => {
    (groups[key(item)] ||= []).push(item);
    return groups;
  }, {} as Record<K, T[]>);
}

type ValueType = string | number | boolean;

export type Union<
  T extends { [key: string]: ValueType } | ReadonlyArray<ValueType>,
> = T extends ReadonlyArray<ValueType>
  ? T[number]
  : T extends { [key: string]: infer U }
  ? U
  : never;
