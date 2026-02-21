/**
 * Firebase Admin SDK Mock for Testing
 *
 * This mock is used in E2E and integration tests to avoid making real FCM calls.
 * Import this file in tests that need to mock Firebase messaging.
 */

export const mockSendEach = jest.fn()
export const mockSend = jest.fn()

jest.mock('firebase-admin/messaging', () => ({
  getMessaging: jest.fn(() => ({
    sendEach: mockSendEach,
    send: mockSend,
  })),
}))

/**
 * Reset all Firebase mocks to default successful responses
 */
export function resetFirebaseMocks(): void {
  mockSendEach.mockClear()
  mockSend.mockClear()

  // Default success response
  mockSendEach.mockResolvedValue({
    responses: [],
    successCount: 0,
    failureCount: 0,
  })

  mockSend.mockResolvedValue('mock-message-id')
}

/**
 * Mock successful FCM send
 */
export function mockSuccessfulSend(count: number = 1): void {
  const responses = Array.from({ length: count }, (_, i) => ({
    success: true,
    messageId: `mock-message-id-${i + 1}`,
  }))

  mockSendEach.mockResolvedValue({
    responses,
    successCount: count,
    failureCount: 0,
  })
}

/**
 * Mock failed FCM send with specific error code
 */
export function mockFailedSend(errorCode: string, errorMessage: string, count: number = 1): void {
  const responses = Array.from({ length: count }, () => ({
    success: false,
    error: {
      code: errorCode,
      message: errorMessage,
    },
  }))

  mockSendEach.mockResolvedValue({
    responses,
    successCount: 0,
    failureCount: count,
  })
}

/**
 * Mock mixed success and failure
 */
export function mockMixedSend(
  successCount: number,
  failureCount: number,
  errorCode: string = 'messaging/invalid-registration-token',
): void {
  const responses = [
    ...Array.from({ length: successCount }, (_, i) => ({
      success: true,
      messageId: `mock-message-id-${i + 1}`,
    })),
    ...Array.from({ length: failureCount }, () => ({
      success: false,
      error: {
        code: errorCode,
        message: 'Mock error',
      },
    })),
  ]

  mockSendEach.mockResolvedValue({
    responses,
    successCount,
    failureCount,
  })
}

/**
 * Mock invalid registration token error
 */
export function mockInvalidTokenError(count: number = 1): void {
  mockFailedSend('messaging/invalid-registration-token', 'Invalid registration token', count)
}

/**
 * Mock not registered error
 */
export function mockNotRegisteredError(count: number = 1): void {
  mockFailedSend('messaging/registration-token-not-registered', 'Token not registered', count)
}

// Auto-reset mocks on import
resetFirebaseMocks()
