import type { Event } from '@sentry/core'

import { isChannelTalkFunctionUrl, withoutQuery } from '@otl/common/utils/request'

const SENSITIVE_HEADERS = new Set(['authorization', 'cookie', 'x-signature'])
const TRACE_URL_KEYS = new Set(['http.url', 'http.target', 'url.full', 'url.path'])
const TRACE_QUERY_KEYS = new Set(['http.query', 'http.fragment', 'url.query', 'url.fragment'])

function getString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function getTraceUrls(data: Record<string, unknown> | undefined): string[] {
  if (!data) return []
  return Object.entries(data)
    .filter(([key, value]) => TRACE_URL_KEYS.has(key) && typeof value === 'string')
    .map(([, value]) => String(value))
}

function sanitizeTraceData<T extends Record<string, unknown>>(data: T): T {
  return Object.fromEntries(
    Object.entries(data)
      .filter(([key]) => !TRACE_QUERY_KEYS.has(key))
      .map(([key, value]) => [key, TRACE_URL_KEYS.has(key) && typeof value === 'string' ? withoutQuery(value) : value]),
  ) as T
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
  const traceData = eventContexts?.trace?.data
  const traceUrls = getTraceUrls(traceData)
  const spanUrls = (event.spans ?? []).flatMap((span) => getTraceUrls(span.data))
  const isChannelTalkEvent = [requestUrl, contextUrl, tagUrl, ...traceUrls, ...spanUrls].some(
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
  if (eventContexts) {
    let sanitizedRequestContext = requestContext
    if (requestContext) {
      sanitizedRequestContext = {
        method: requestContext.method,
        url: contextUrl ? withoutQuery(contextUrl) : undefined,
      }
    }
    let sanitizedTraceContext = eventContexts.trace
    if (eventContexts.trace) {
      sanitizedTraceContext = {
        ...eventContexts.trace,
        data: traceData ? sanitizeTraceData(traceData) : undefined,
      }
    }
    contexts = {
      ...eventContexts,
      request: sanitizedRequestContext,
      trace: sanitizedTraceContext,
    }
  }

  let tags = eventTags
  if (eventTags) {
    tags = {
      ...eventTags,
      url: tagUrl ? withoutQuery(tagUrl) : undefined,
    }
  }

  const spans = event.spans?.map((span) => ({
    ...span,
    data: sanitizeTraceData(span.data),
  }))
  const sanitizedEvent = {
    ...event,
    request,
    contexts,
    spans,
  }
  return { ...sanitizedEvent, tags }
}
