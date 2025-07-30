export const SyncStatus = {
  NotStarted: 'NOT_STARTED',
  InProgress: 'IN_PROGRESS',
  Error: 'ERROR',
  Completed: 'COMPLETED',
}
export type SyncStatus = (typeof SyncStatus)[keyof typeof SyncStatus]
