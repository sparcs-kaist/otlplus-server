import { Test, TestingModule } from '@nestjs/testing'

/**
 * Helper function to create a NestJS testing module with common setup
 */
export async function createTestingModule(providers: any[]): Promise<TestingModule> {
  return await Test.createTestingModule({
    providers,
  }).compile()
}

/**
 * Wait for a condition to be true with timeout
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeoutMs: number = 5000,
  intervalMs: number = 100,
): Promise<void> {
  const startTime = Date.now()

  while (Date.now() - startTime < timeoutMs) {
    if (await condition()) {
      return
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }

  throw new Error(`Timeout waiting for condition after ${timeoutMs}ms`)
}

/**
 * Sleep for a specified number of milliseconds
 */
export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Generate a unique idempotency key
 */
export function generateIdempotencyKey(prefix: string = 'idem'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}`
}

/**
 * Generate a unique batch ID
 */
export function generateBatchId(prefix: string = 'batch'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}`
}

/**
 * Create mock user data for testing
 */
export interface MockUser {
  id: number
  departmentId?: number
  majorId?: number
  yearJoined?: number
}

export function createMockUsers(count: number, options?: Partial<MockUser>): MockUser[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    departmentId: options?.departmentId ?? (i % 3) + 1,
    majorId: options?.majorId ?? (i % 5) + 1,
    yearJoined: options?.yearJoined ?? 2020 + (i % 5),
  }))
}

/**
 * Check if a date is within a time window
 */
export function isWithinTimeWindow(date: Date, targetDate: Date, windowMs: number): boolean {
  const diff = Math.abs(date.getTime() - targetDate.getTime())
  return diff <= windowMs
}

/**
 * Check if the current time is in night hours (22:00-08:00)
 */
export function isNightTime(date: Date = new Date()): boolean {
  const hour = date.getHours()
  return hour >= 22 || hour < 8
}

/**
 * Set time to specific hour for testing
 */
export function setTimeToHour(hour: number, minute: number = 0): Date {
  const date = new Date()
  date.setHours(hour, minute, 0, 0)
  return date
}

/**
 * Chunk array into smaller arrays
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize))
  }
  return chunks
}
