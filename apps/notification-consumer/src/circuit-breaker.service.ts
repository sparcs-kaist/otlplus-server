import { Injectable } from '@nestjs/common'

import logger from '@otl/common/logger/logger'

enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

const WINDOW_MS = 60_000 // 1 minute sliding window
const FAILURE_THRESHOLD = 0.5 // 50% failure rate → OPEN
const OPEN_DURATION_MS = 30_000 // 30 seconds in OPEN state
const MIN_REQUESTS = 10 // Minimum requests before evaluating

@Injectable()
export class CircuitBreakerService {
  private state: CircuitState = CircuitState.CLOSED

  private successCount = 0

  private failureCount = 0

  private lastFailureTime = 0

  private openedAt = 0

  isOpen(): boolean {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.openedAt > OPEN_DURATION_MS) {
        this.state = CircuitState.HALF_OPEN
        logger.info('[CircuitBreaker] Transitioning to HALF_OPEN')
        return false
      }
      return true
    }
    return false
  }

  record(successCount: number, failureCount: number): void {
    if (this.state === CircuitState.HALF_OPEN) {
      if (failureCount === 0) {
        this.reset()
        logger.info('[CircuitBreaker] HALF_OPEN → CLOSED (probe succeeded)')
      }
      else {
        this.trip()
      }
      return
    }

    this.successCount += successCount
    this.failureCount += failureCount

    const totalRequests = this.successCount + this.failureCount
    if (totalRequests >= MIN_REQUESTS) {
      const failureRate = this.failureCount / totalRequests
      if (failureRate > FAILURE_THRESHOLD) {
        this.trip()
      }
    }

    // Reset window periodically
    if (Date.now() - this.lastFailureTime > WINDOW_MS) {
      this.successCount = successCount
      this.failureCount = failureCount
    }

    if (failureCount > 0) {
      this.lastFailureTime = Date.now()
    }
  }

  private trip(): void {
    this.state = CircuitState.OPEN
    this.openedAt = Date.now()
    logger.warn('[CircuitBreaker] Circuit OPENED due to high failure rate')
  }

  private reset(): void {
    this.state = CircuitState.CLOSED
    this.successCount = 0
    this.failureCount = 0
    this.openedAt = 0
  }

  getState(): string {
    return this.state
  }
}
