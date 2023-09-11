import { SemesterRepository } from '../../prisma/repositories/semester.repository';

export function applyOrder<T>(query: T[], order_opt: string[]) {
  if (order_opt.length == 0) {
    return query;
  } else {
    return (
      query?.sort((a: T, b: T) => {
        for (let i = 0; i < order_opt.length; i++) {
          const order = order_opt[i];
          if (a[order] > b[order]) {
            return 1;
          } else if (a[order] < b[order]) {
            return -1;
          }
        }
        return 0;
      }) ?? []
    );
  }
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

export function orderFilter(order: string[]) {
  const orderFilter: orderFilterType[] = [];
  order.forEach((orderList) => {
    const orderDict: { [key: string]: string } = {};
    let order = 'asc';
    const orderBy = orderList.split(/-|__/);
    if (orderBy[0] == '') {
      order = 'desc';
    }

    orderDict[orderBy[orderBy.length - 1]] = order;
    orderFilter.push(orderDictHelper(orderBy.slice(1), order));
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
