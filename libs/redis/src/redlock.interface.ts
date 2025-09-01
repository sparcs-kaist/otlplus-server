// Injection token for the options
export const REDLOCK_OPTIONS = Symbol('REDLOCK_OPTIONS')

// Interface for the module options
export interface RedlockModuleOptions {
  retryDelay?: number
  retryCount?: number
}
