import {
  SyncResultDetail,
  SyncResultDetails,
  SyncResultSummaries,
  SyncResultSummary,
  SyncTimeType,
} from '@otl/scholar-sync/common/interfaces/ISync';

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

export function summarizeSyncResult(syncResult: SyncResultDetail): SyncResultSummary {
  return {
    type: syncResult.type,
    created: syncResult.created.length,
    updated: syncResult.updated.length,
    skipped: syncResult.skipped.length,
    errors: syncResult.errors.length,
    deleted: syncResult.deleted.length,
  };
}

export function summarizeSyncResults(syncResults: SyncResultDetails): SyncResultSummaries {
  return {
    time: syncResults.time,
    year: syncResults.year,
    semester: syncResults.semester,
    results: syncResults.results.map(summarizeSyncResult),
  };
}
