import { ISync } from '@otl/api-interface/src/interfaces/ISync';

export function putPreviousSemester(semesters: [number, number][], count: number) {
  if (count === 0) return;
  const [year, semester] = semesters[semesters.length - 1];
  let newYear = year;
  let newSemester = semester;
  if (semester === 1) {
    newYear -= 1;
    newSemester = 4;
  } else {
    newSemester -= 1;
  }
  semesters.push([newYear, newSemester]);
  putPreviousSemester(semesters, count - 1);
}

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

export function summarizeSyncResult(syncResult: ISync.SyncResultDetail): ISync.SyncResultSummary {
  return {
    type: syncResult.type,
    created: syncResult.created.length,
    updated: syncResult.updated.length,
    skipped: syncResult.skipped.length,
    errors: syncResult.errors.length,
    deleted: syncResult.deleted.length,
  };
}

export function summarizeSyncResults(syncResults: ISync.SyncResultDetails): ISync.SyncResultSummaries {
  return {
    time: syncResults.time,
    year: syncResults.year,
    semester: syncResults.semester,
    results: syncResults.results.map(summarizeSyncResult),
  };
}
