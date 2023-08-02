export function normalizeArray<T>(
  arr: T[],
  selector: (item: T) => string | number | symbol | null = (item: any) =>
    item.id,
  defaultObj?: { [key: string]: T | undefined },
): { [key: string | number | symbol]: T | undefined } {
  const normalizeObj: { [key: string | number | symbol]: T | undefined } =
    defaultObj || {}

  arr.forEach(data => {
    const key = selector(data)
    if (key !== null) normalizeObj[key] = data
  })

  return normalizeObj
}

export function groupBy<T>(
  arr: T[],
  selector: (item: T) => string | number | null = (item: any) => item.id,
) {
  const map: Record<string, T[] | undefined> = {}

  arr.forEach(data => {
    const key = selector(data)
    if (key !== null) {
      if (map[key]) {
        map[key]!.push(data)
      } else {
        map[key] = [data]
      }
    }
  })

  return map
}

type ValueType = string | number | boolean


export type Union<
  T extends { [key: string]: ValueType } | ReadonlyArray<ValueType>,
  > = T extends ReadonlyArray<ValueType>
  ? T[number]
  : T extends { [key: string]: infer U }
    ? U
    : never




