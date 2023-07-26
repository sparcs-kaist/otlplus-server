export function applyOrder<T>(query: T[], order_opt: string[]) {
  if (order_opt.length == 0) {
    return query;
  } else {
    return query?.sort((a: T, b: T) => {
      for(let i=0; i < order_opt.length; i++) {
        const order = order_opt[i];
        if (a[order] > b[order]) {
          return 1;
        } else if (a[order] < b[order]) {
          return -1;
        }
      }
      return 0;
    }) ?? []
  }
}

export function applyOffset<T>(query: T[], offset: number) {
  if (!(offset)) {
    return query;
  } else {
    return query?.slice(offset) ?? [];
  }
}