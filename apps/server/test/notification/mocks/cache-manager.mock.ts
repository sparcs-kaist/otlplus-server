import { Cache } from 'cache-manager'

export class MockCacheManager implements Partial<Cache> {
  private store = new Map<
    string,
    {
      value: string
      expiry: number
    }
  >()

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key)
    if (!entry) return null

    // Check if expired (use new Date().getTime() to work with jest.setSystemTime)
    if (new Date().getTime() > entry.expiry) {
      this.store.delete(key)
      return null
    }

    // Return the raw value as-is (don't auto-parse JSON)
    // Services should parse manually if they stored JSON strings
    return entry.value as T
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<T> {
    // Note: ttl parameter is in milliseconds (not seconds like standard cache-manager)
    // This matches the actual usage in the codebase where windowMs is passed directly
    const ttlMs = ttl ?? 3600 * 1000 // Default 1 hour
    const expiry = new Date().getTime() + ttlMs // Use new Date().getTime() to work with jest.setSystemTime

    const serialized = typeof value === 'string' ? value : JSON.stringify(value)

    this.store.set(key, {
      value: serialized,
      expiry,
    })

    return value
  }

  async del(key: string): Promise<boolean> {
    return this.store.delete(key)
  }

  async reset(): Promise<boolean> {
    this.store.clear()
    return true
  }

  async wrap<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== null) return cached

    const value = await fn()
    await this.set(key, value)
    return value
  }

  // Helper methods for testing
  has(key: string): boolean {
    return this.store.has(key)
  }

  keys(): string[] {
    return Array.from(this.store.keys())
  }

  size(): number {
    return this.store.size
  }

  async clear(): Promise<boolean> {
    this.store.clear()
    return true
  }
}
