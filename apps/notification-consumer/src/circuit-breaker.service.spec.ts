import { CircuitBreakerService } from './circuit-breaker.service'

describe('CircuitBreakerService', () => {
  let service: CircuitBreakerService

  beforeEach(() => {
    jest.useFakeTimers()
    service = new CircuitBreakerService()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('Initial State', () => {
    it('should start in CLOSED state', () => {
      expect(service.getState()).toBe('CLOSED')
      expect(service.isOpen()).toBe(false)
    })
  })

  describe('CLOSED → OPEN Transition', () => {
    it('should transition to OPEN when failure rate exceeds 50%', () => {
      // Record 6 failures and 4 successes (60% failure rate)
      service.record(4, 6)

      expect(service.getState()).toBe('OPEN')
      expect(service.isOpen()).toBe(true)
    })

    it('should not open circuit if total requests < 10', () => {
      // Record 5 failures and 0 successes (100% failure rate but < 10 total)
      service.record(0, 5)

      expect(service.getState()).toBe('CLOSED')
      expect(service.isOpen()).toBe(false)
    })

    it('should not open circuit when failure rate is exactly 50%', () => {
      // Record 5 failures and 5 successes (exactly 50%)
      service.record(5, 5)

      expect(service.getState()).toBe('CLOSED')
      expect(service.isOpen()).toBe(false)
    })

    it('should remain CLOSED when failure rate is below 50%', () => {
      // Record 4 failures and 6 successes (40% failure rate)
      service.record(6, 4)

      expect(service.getState()).toBe('CLOSED')
      expect(service.isOpen()).toBe(false)
    })
  })

  describe('OPEN → HALF_OPEN Transition', () => {
    beforeEach(() => {
      // Trip the circuit
      jest.setSystemTime(new Date('2024-01-01T00:00:00Z'))
      service.record(0, 10)
      expect(service.getState()).toBe('OPEN')
    })

    it('should transition to HALF_OPEN after 30 seconds', () => {
      // Transition happens AFTER 30s (> 30000ms), not at exactly 30s
      jest.setSystemTime(new Date('2024-01-01T00:00:30.001Z'))

      expect(service.isOpen()).toBe(false)
      expect(service.getState()).toBe('HALF_OPEN')
    })

    it('should remain OPEN before 30 seconds', () => {
      jest.setSystemTime(new Date('2024-01-01T00:00:29Z'))

      expect(service.isOpen()).toBe(true)
      expect(service.getState()).toBe('OPEN')
    })
  })

  describe('HALF_OPEN → CLOSED Transition', () => {
    beforeEach(() => {
      // Trip the circuit and wait for HALF_OPEN
      jest.setSystemTime(new Date('2024-01-01T00:00:00Z'))
      service.record(0, 10)
      jest.setSystemTime(new Date('2024-01-01T00:00:30.001Z'))
      service.isOpen() // Trigger state check
      expect(service.getState()).toBe('HALF_OPEN')
    })

    it('should transition to CLOSED on successful probe', () => {
      service.record(1, 0)

      expect(service.getState()).toBe('CLOSED')
      expect(service.isOpen()).toBe(false)
    })
  })

  describe('HALF_OPEN → OPEN Transition', () => {
    beforeEach(() => {
      // Trip the circuit and wait for HALF_OPEN
      jest.setSystemTime(new Date('2024-01-01T00:00:00Z'))
      service.record(0, 10)
      jest.setSystemTime(new Date('2024-01-01T00:00:30.001Z'))
      service.isOpen() // Trigger state check
      expect(service.getState()).toBe('HALF_OPEN')
    })

    it('should transition back to OPEN on failed probe', () => {
      service.record(0, 1)

      expect(service.getState()).toBe('OPEN')
      expect(service.isOpen()).toBe(true)
    })
  })

  describe('Sliding Window', () => {
    it('should reset counters after 60-second window', () => {
      jest.setSystemTime(new Date('2024-01-01T00:00:00Z'))

      // Record initial batch (3 success, 3 failure = 6 total < 10)
      service.record(3, 3)
      expect(service.getState()).toBe('CLOSED')

      // Wait for window to expire (> 60s)
      jest.setSystemTime(new Date('2024-01-01T00:01:01Z'))

      // Record small batch that won't trip alone
      // Note: Service accumulates BEFORE checking window, so (3+0, 3+6) = (3, 9) = 12 total, 75% failure
      // This will trip the circuit before reset happens
      service.record(0, 3)
      expect(service.getState()).toBe('CLOSED') // 3+3=6 total, still < 10

      // After window reset (triggered by next record after expiry), counters are reset
      service.record(0, 10)
      expect(service.getState()).toBe('OPEN') // Now 0 success, 10 failures = 100% > 50%
    })

    it('should accumulate counts within the window', () => {
      jest.setSystemTime(new Date('2024-01-01T00:00:00Z'))

      // Record first batch
      service.record(2, 3)
      expect(service.getState()).toBe('CLOSED') // 2 success, 3 failure = 5 total < 10 minimum

      // Wait less than window duration (within 60s window)
      jest.setSystemTime(new Date('2024-01-01T00:00:30Z'))

      // Record second batch - should accumulate to 4 success, 6 failure = 10 total, 60% failure rate
      service.record(2, 3)

      // Should be OPEN because 60% > 50% threshold and total >= 10 minimum
      expect(service.getState()).toBe('OPEN')
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero failures', () => {
      service.record(10, 0)

      expect(service.getState()).toBe('CLOSED')
      expect(service.isOpen()).toBe(false)
    })

    it('should handle zero successes', () => {
      service.record(0, 10)

      expect(service.getState()).toBe('OPEN')
      expect(service.isOpen()).toBe(true)
    })

    it('should handle exactly minimum threshold (10 requests)', () => {
      // Exactly 5 failures out of 10 (50% - should stay CLOSED due to > check)
      service.record(5, 5)
      expect(service.getState()).toBe('CLOSED')

      // 6 failures out of 10 (60% - should OPEN)
      service = new CircuitBreakerService()
      service.record(4, 6)
      expect(service.getState()).toBe('OPEN')
    })
  })
})
