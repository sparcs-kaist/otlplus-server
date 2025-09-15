export const RedisTTL = {
  DAY: 3600 * 24 * 1000,
  WEEK: 3600 * 24 * 7 * 1000,
  HOUR: 3600 * 1000,
  HALF_HOUR: 1800 * 1000,
  MIN: 60 * 1000,
} as const
export type TTL = (typeof RedisTTL)[keyof typeof RedisTTL]
