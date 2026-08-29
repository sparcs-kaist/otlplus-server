import type { Event } from '@sentry/core'

import { isChannelTalkFunctionUrl, withoutQuery } from '@otl/common/utils/request'

const SENSITIVE_HEADERS = new Set(['authorization', 'cookie', 'x-signature'])

function getString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

export function sanitizeSentryEvent<T extends Event>(event: T): T {
  const { contexts: eventContexts, request: eventRequest, tags: eventTags } = event
  const headers = Object.fromEntries(
    Object.entries(eventRequest?.headers ?? {}).filter(([name]) => !SENSITIVE_HEADERS.has(name.toLowerCase())),
  )
  const requestContext = eventContexts?.request
  const requestUrl = eventRequest?.url
  const contextUrl = getString(requestContext?.url)
  const tagUrl = getString(eventTags?.url)
  const isChannelTalkEvent = [requestUrl, contextUrl, tagUrl].some(
    (url) => url !== undefined && isChannelTalkFunctionUrl(url),
  )

  if (!isChannelTalkEvent) {
    return {
      ...event,
      request: eventRequest ? { ...eventRequest, headers } : undefined,
    }
  }

  let request = eventRequest
  if (eventRequest) {
    request = {
      url: requestUrl ? withoutQuery(requestUrl) : undefined,
      method: eventRequest.method,
      env: eventRequest.env,
      headers,
    }
  }

  let contexts = eventContexts
  if (eventContexts && requestContext) {
    contexts = {
      ...eventContexts,
      request: {
        method: requestContext.method,
        url: contextUrl ? withoutQuery(contextUrl) : undefined,
      },
    }
  }

  let tags = eventTags
  if (eventTags) {
    tags = {
      ...eventTags,
      url: tagUrl ? withoutQuery(tagUrl) : undefined,
    }
  }

  const sanitizedEvent = { ...event, request, contexts }
  return { ...sanitizedEvent, tags }
}
