import { SemesterRepository } from '../../prisma/repositories/semester.repository';

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

export function semesterFilter(
  year: number,
  semester: number,
): { year?: number; semester?: number } {
  let semesterFilter: object = {};
  if (year) {
    semesterFilter = { ...semesterFilter, year: year };
  }
  if (semester) {
    semesterFilter = { ...semesterFilter, semester: semester };
  }
  return semesterFilter;
}

export type orderFilterType = {
  [key: string]: orderFilterType | string;
};

export type relationOrderDict = {
  [key: string]: relationOrderDict | string;
};

export function orderFilter(order: string[] | undefined): orderFilterType[] {
  if (order === undefined) {
    return [];
  }
  const orderFilter: orderFilterType[] = [];
  order.forEach((str) => {
    const orderDict: relationOrderDict = {};
    let order = 'asc';
    const orderBy = str.split(/-/);
    console.log(orderBy, str);

    const orderByStr = str.startsWith('-') ? str.split(/-/)[1] : str;
    if (str.startsWith('-')) {
      order = 'desc';
    }

    const orderByList = orderByStr.split('__');
    if (orderByList.length == 1) {
      orderDict[orderBy[orderBy.length - 1]] = order;
      orderFilter.push(orderDict);
    } else {
      const relation = orderByList[0];
      const field = orderByList[1];
      const fieldDict: relationOrderDict = {};
      fieldDict[field] = order;
      orderDict[relation] = fieldDict;
      orderFilter.push(orderDict);
    }
    console.log(orderBy);
  });
  return orderFilter;
}

export function orderFilterLegacy(
  order: string[] | undefined,
): orderFilterType[] {
  if (order === undefined) {
    return [];
  }
  const orderFilter: orderFilterType[] = [];
  order.forEach((orderList) => {
    const orderDict: { [key: string]: string } = {};
    let order = 'asc';
    const orderBy = orderList.split(/-|__/);
    if (orderBy[0] == '') {
      order = 'desc';
    }
    console.log(orderBy);

    orderDict[orderBy[orderBy.length - 1]] = order;
    orderFilter.push(orderDict);
  });
  return orderFilter;
}

function orderDictHelper(orderList: string[], order: string): orderFilterType {
  if (orderList.length == 0) {
    return {};
  } else if (orderList[0] == '') {
    return orderDictHelper(orderList.slice(1), order);
  } else if (orderList.length == 1) {
    return { [orderList[0]]: order };
  } else {
    return { [orderList[0]]: orderDictHelper(orderList.slice(1), order) };
  }
}

export async function validateYearAndSemester(
  year: number,
  semester: number,
  semesterRepo: SemesterRepository,
) {
  const existsSemester: boolean = await semesterRepo.existsSemester(
    year,
    semester,
  );
  return (
    existsSemester ||
    (2009 < year && year < 2018 && semester && [1, 3].includes(semester))
  );
}
