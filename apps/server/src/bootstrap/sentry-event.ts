import type { Event } from '@sentry/core'

const SENSITIVE_HEADERS = new Set(['authorization', 'cookie', 'x-signature'])

function withoutQuery(url: string): string {
  return url.split('?')[0]
}

function isChannelTalkFunctionUrl(url: string): boolean {
  const sanitizedUrl = withoutQuery(url)
  const protocolIndex = sanitizedUrl.indexOf('://')
  const pathname = protocolIndex === -1 ? sanitizedUrl : sanitizedUrl.slice(sanitizedUrl.indexOf('/', protocolIndex + 3))
  return pathname === '/functions' || pathname.startsWith('/functions/')
}

export function sanitizeSentryEvent<T extends Event>(event: T): T {
  if (!event.request) return event

  const headers = Object.fromEntries(
    Object.entries(event.request.headers ?? {}).filter(([name]) => !SENSITIVE_HEADERS.has(name.toLowerCase())),
  )

  if (!event.request.url || !isChannelTalkFunctionUrl(event.request.url)) {
    return {
      ...event,
      request: { ...event.request, headers },
    }
  }

  return {
    ...event,
    request: {
      url: withoutQuery(event.request.url),
      method: event.request.method,
      env: event.request.env,
      headers,
    },
  }
}
