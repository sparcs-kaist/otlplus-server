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



