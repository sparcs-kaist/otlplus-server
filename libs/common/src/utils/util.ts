export function normalizeArray<T>(
  arr: T[],
  // eslint-disable-next-line default-param-last
  selector: (item: T) => string | number | symbol | null = (item: any) => item.id,
  defaultObj?: { [key: string]: T | undefined },
): { [key: string | number | symbol]: T | undefined } {
  const normalizeObj: { [key: string | number | symbol]: T | undefined } = defaultObj || {}

  arr.forEach((data) => {
    const key = selector(data)
    if (key !== null) normalizeObj[key] = data
  })

  return normalizeObj
}

export function groupBy<T, K extends keyof any>(arr: T[], selector: (i: T) => K): Record<K, T[] | undefined> {
  return arr.reduce(
    (groups: Record<K, T[] | undefined>, item) => {
      // eslint-disable-next-line no-param-reassign
      (groups[selector(item)] ??= []).push(item)
      return groups
    },
    {} as Record<K, T[] | undefined>,
  )
}

export function getRandomChoice<T>(choices: T[]): T {
  const randomIndex = Math.floor(Math.random() * choices.length)
  return choices[randomIndex]
}

export function applyOrder<T>(query: T[], order_opt: (keyof T)[]): T[] {
  if (order_opt.length === 0) {
    return query
  }
  return query.sort((a: T, b: T): 1 | 0 | -1 => {
    for (const order of order_opt) {
      if (a[order] === b[order]) {
        continue
      }
      return a[order] > b[order] ? 1 : -1
    }
    return 0
  })
}

export function applyOffset<T>(query: T[], offset: number) {
  if (!offset) {
    return query
  }
  return query?.slice(offset) ?? []
}

export const getTimeNumeric = (time: Date, isClass = true) => {
  const beginNumeric = time.getUTCHours() * 60 + time.getUTCMinutes()
  if (beginNumeric % 30 && isClass) {
    return beginNumeric - (beginNumeric % 30)
  }
  return beginNumeric
}

export function generationUnionTypeChecker<UnionType extends string>(...values: UnionType[]) {
  return (value: unknown): UnionType | Error => {
    if (typeof value !== 'string') return new Error(`Invalid value: ${value}`)
    return values.includes(value as UnionType) ? (value as UnionType) : new Error(`Invalid value: ${value}`)
  }
}

export function getCurrentMethodName(): string {
  const err = new Error()
  const stack = err.stack?.split('\n')
  if (stack && stack.length > 2) {
    const line = stack[2].trim() // 예: 'at ClassName.methodName (file.ts:line:column)'
    const match = line.match(/at\s+(.*)\s+\(/)
    if (match && match[1]) {
      return match[1]
    }
  }
  return 'unknown'
}
