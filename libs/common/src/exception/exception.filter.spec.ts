import type { Event } from '@sentry/node'

import { redactFriendInviteRequest } from './exception.filter'

describe('redactFriendInviteRequest', () => {
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
