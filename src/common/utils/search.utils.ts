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

export function orderFilter(order: string[] | undefined): orderFilterType[] {
  // TODO: unit test
  if (order === undefined) return [];

  const orderFilter: orderFilterType[] = [];
  order.forEach((orderList) => {
    const orderBy = orderList.split('-');
    const order = orderBy[0] == '' ? 'desc' : 'asc';

    const orderDict = orderDictHelper(
      orderBy[orderBy.length - 1].split('__'),
      order,
    );
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
