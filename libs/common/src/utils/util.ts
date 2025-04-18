export function normalizeArray<T>(
  arr: T[],
  selector: (item: T) => string | number | symbol | null = (item: any) => item.id,
  defaultObj?: { [key: string]: T | undefined },
): { [key: string | number | symbol]: T | undefined } {
  const normalizeObj: { [key: string | number | symbol]: T | undefined } = defaultObj || {};

  arr.forEach((data) => {
    const key = selector(data);
    if (key !== null) normalizeObj[key] = data;
  });

  return normalizeObj;
}

export function groupBy<T, K extends keyof any>(arr: T[], selector: (i: T) => K): Record<K, T[] | undefined> {
  return arr.reduce(
    (groups: Record<K, T[] | undefined>, item) => {
      (groups[selector(item)] ??= []).push(item);
      return groups;
    },
    {} as Record<K, T[] | undefined>,
  );
}

export function getRandomChoice<T>(choices: T[]): T {
  const randomIndex = Math.floor(Math.random() * choices.length);
  return choices[randomIndex];
}

export function applyOrder<T>(query: T[], order_opt: (keyof T)[]): T[] {
  if (order_opt.length == 0) {
    return query;
  }
  return query.sort((a: T, b: T): 1 | 0 | -1 => {
    for (const order of order_opt) {
      if (a[order] === b[order]) {
        continue;
      }
      return a[order] > b[order] ? 1 : -1;
    }
    return 0;
  });
}

export function applyOffset<T>(query: T[], offset: number) {
  if (!offset) {
    return query;
  } else {
    return query?.slice(offset) ?? [];
  }
}

export const getTimeNumeric = (time: Date, isClass = true) => {
  const beginNumeric = time.getUTCHours() * 60 + time.getUTCMinutes();
  if (beginNumeric % 30 && isClass) {
    return beginNumeric - (beginNumeric % 30);
  } else {
    return beginNumeric;
  }
};
