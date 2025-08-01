import { SyncStatus } from '@otl/common/enum/sync'

type ValueType = string | number | boolean

export type Union<T extends { [key: string]: ValueType } | ReadonlyArray<ValueType>> =
  T extends ReadonlyArray<ValueType> ? T[number] : T extends { [key: string]: infer U } ? U : never

export interface SyncProgress {
  total: number
  completed: number
  status: SyncStatus
  startedAt: Date
}

export interface SyncSSEMessage {
  requestId: string
  progress: SyncProgress
  error?: string
  message?: string
}
