import type { Event, TransactionEvent } from '@sentry/core'

import { sanitizeSentryEvent } from './sentry-event'

describe('sanitizeSentryEvent', () => {
  it.each([
    ['error', { type: undefined } satisfies Event],
    ['transaction', { type: 'transaction' } satisfies TransactionEvent],
  ])('removes ChannelTalk request secrets from %s events', (_name, event) => {
    const sanitized = sanitizeSentryEvent({
      ...event,
      request: {
        url: 'https://otl.example.com/FuNcTiOnS/v1?secret=query',
        method: 'PUT',
        data: { params: { input: { keyword: 'secret keyword' } }, context: { channelId: 'secret-channel' } },
        query_string: 'secret=query',
        cookies: { session: 'secret-cookie' },
        headers: {
          accept: 'application/json',
          authorization: 'Bearer secret-token',
          cookie: 'session=secret-cookie',
          'x-signature': 'secret-signature',
        },
      },
      contexts: {
        request: {
          method: 'PUT',
          url: '/FuNcTiOnS/v1?secret=context-query',
          body: { context: { channelId: 'secret-channel' } },
          headers: { cookie: 'secret-cookie' },
        },
      },
      tags: { url: '/FuNcTiOnS/v1?secret=tag-query' },
    })

    expect(sanitized.request).toEqual({
      url: 'https://otl.example.com/FuNcTiOnS/v1',
      method: 'PUT',
      headers: { accept: 'application/json' },
    })
    expect(sanitized.contexts?.request).toEqual({
      method: 'PUT',
      url: '/FuNcTiOnS/v1',
    })
    expect(sanitized.tags?.url).toBe('/FuNcTiOnS/v1')
  })

  it('removes ChannelTalk query data from root traces and child spans', () => {
    const sanitized = sanitizeSentryEvent({
      type: 'transaction',
      contexts: {
        trace: {
          trace_id: '0'.repeat(32),
          span_id: '1'.repeat(16),
          data: {
            'http.target': '/FuNcTiOnS/v1?secret=root-target',
            'http.query': 'secret=root-query',
            safe: 'preserved',
          },
        },
      },
      spans: [
        {
          trace_id: '0'.repeat(32),
          span_id: '2'.repeat(16),
          start_timestamp: 1,
          timestamp: 2,
          data: {
            'http.url': 'https://otl.example.com/FuNcTiOnS/v1?secret=span-url',
            'url.query': 'secret=span-query',
            safe: 'preserved',
          },
        },
      ],
    } satisfies TransactionEvent)

    expect(sanitized.contexts?.trace?.data).toEqual({
      'http.target': '/FuNcTiOnS/v1',
      safe: 'preserved',
    })
    expect(sanitized.spans?.[0].data).toEqual({
      'http.url': 'https://otl.example.com/FuNcTiOnS/v1',
      safe: 'preserved',
    })
  })

  it('detects a ChannelTalk transaction from trace data without a request', () => {
    const sanitized = sanitizeSentryEvent({
      type: 'transaction',
      contexts: {
        trace: {
          trace_id: '0'.repeat(32),
          span_id: '1'.repeat(16),
          data: {
            'url.full': 'https://otl.example.com/FUNCTIONS/v1?secret=trace-only',
            'url.query': 'secret=trace-only-query',
          },
        },
      },
    } satisfies TransactionEvent)

    expect(sanitized.contexts?.trace?.data).toEqual({
      'url.full': 'https://otl.example.com/FUNCTIONS/v1',
    })
  })

  it('preserves non-ChannelTalk trace data', () => {
    const event = {
      type: 'transaction',
      contexts: {
        trace: {
          trace_id: '0'.repeat(32),
          span_id: '1'.repeat(16),
          data: {
            'http.url': 'https://otl.example.com/api/courses?keyword=programming',
            'http.query': 'keyword=programming',
          },
        },
      },
    } satisfies TransactionEvent

    expect(sanitizeSentryEvent(event).contexts?.trace?.data).toEqual(event.contexts.trace.data)
  })
})
