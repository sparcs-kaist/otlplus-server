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
})
