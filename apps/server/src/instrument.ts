/**
 * Sentry Instrumentation for OTL Server
 *
 * This file MUST be imported before any other module.
 * It initializes Sentry with full performance monitoring:
 * - HTTP request tracing
 * - Prisma (DB) query tracing
 * - Express middleware tracing
 * - Profiling for performance bottleneck detection
 */
import * as Sentry from '@sentry/nestjs'
import { nodeProfilingIntegration } from '@sentry/profiling-node'

import settings from './settings'

const { dsn } = settings().getSentryConfig()

Sentry.init({
  dsn: dsn as string,
  environment: process.env.NODE_ENV || 'local',
  release: settings().getVersion(),

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'prod' ? 0.2 : 1.0,

  // Profiling — captures CPU profiles for sampled transactions
  profilesSampleRate: process.env.NODE_ENV === 'prod' ? 0.1 : 1.0,

  integrations: [
    // Prisma ORM integration — traces all DB queries as spans
    Sentry.prismaIntegration(),
    // CPU Profiling — identifies hot code paths
    nodeProfilingIntegration(),
  ],

  // Attach request headers/cookies/body to error events for debugging
  sendDefaultPii: true,
})
