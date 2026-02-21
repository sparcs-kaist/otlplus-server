/**
 * Sentry Instrumentation for OTL Scholar Sync
 *
 * This file MUST be imported before any other module.
 * It initializes Sentry with full performance monitoring.
 */
import * as Sentry from '@sentry/nestjs'

import settings from '../settings'

const { dsn } = settings().getSentryConfig()

Sentry.init({
  dsn: dsn as string,
  environment: process.env.NODE_ENV || 'local',
  release: settings().getVersion(),

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'prod' ? 0.2 : 1.0,

  // Profiling
  profilesSampleRate: process.env.NODE_ENV === 'prod' ? 0.1 : 1.0,

  integrations: [
    Sentry.prismaIntegration(),
  ],

  sendDefaultPii: true,
})
