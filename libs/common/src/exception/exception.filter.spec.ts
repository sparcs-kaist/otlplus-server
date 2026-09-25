import type { Event } from '@sentry/node'

import { redactFriendInviteRequest } from './exception.filter'

describe('redactFriendInviteRequest', () => {
  it.each([
    ['POST', 'https://otl.example/api/v2/friends'],
    ['POST', '/API/v2/friends/?retry=1'],
    ['GET', '/api/v2/friends/code'],
    ['GET', '/api/v2/friends/code/'],
    ['POST', '/api/v2/friends/invites'],
  ])('removes invite credentials from %s %s events and transactions', (method, url) => {
    for (const type of [undefined, 'transaction'] as const) {
      for (const data of [{ code: 'K7L4MX' }, '{"code":"K7L4MX"}']) {
        const event: Event = {
          type,
          request: { url, method, data },
          contexts: {
            request: { body: data, data, method },
            response: { body: data, data, statusCode: 200 },
          },
        }
        expect(redactFriendInviteRequest(event)).toBe(event)
        expect(JSON.stringify(event)).not.toContain('K7L4MX')
        expect(event.contexts?.response?.statusCode).toBe(200)
        expect(event.contexts?.request?.method).toBe(method)
      }
    }
  })

  it('redacts fixed-code requests when only the custom request context has a URL', () => {
    const event: Event = {
      contexts: {
        request: { url: '/api/v2/friends', method: 'POST', body: { code: 'K7L4MX' } },
        response: { data: { code: 'K7L4MX' } },
      },
    }
    expect(JSON.stringify(redactFriendInviteRequest(event))).not.toContain('K7L4MX')
  })

  it('removes automatic and custom request bodies without affecting unrelated requests', () => {
    for (const data of [{ token: 'private-invite' }, '{"token":"private-invite"}']) {
      const event: Event = {
        request: { url: 'https://otl.example/api/v2/friends/invites/accept', data },
        contexts: { request: { body: { token: 'private-invite' }, method: 'POST' } },
      }
      expect(redactFriendInviteRequest(event)).toBe(event)
      expect(JSON.stringify(event)).not.toContain('private-invite')
      expect(event.contexts?.request?.method).toBe('POST')
    }

    const contextOnly: Event = {
      contexts: {
        request: { url: '/API/v2/friends/invites/accept/?retry=1', body: { token: 'private-invite' } },
      },
    }
    expect(JSON.stringify(redactFriendInviteRequest(contextOnly))).not.toContain('private-invite')

    const unrelated: Event = { request: { url: '/api/v2/friends/1/favorite', data: { isFavorite: true } } }
    expect(redactFriendInviteRequest(unrelated).request?.data).toEqual({ isFavorite: true })
    expect(redactFriendInviteRequest({})).toEqual({})
  })
})
