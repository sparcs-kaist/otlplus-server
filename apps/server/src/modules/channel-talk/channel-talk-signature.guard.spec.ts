import { createHmac } from 'crypto'

import { verifyChannelTalkSignature } from './channel-talk-signature'

describe('verifyChannelTalkSignature', () => {
  const signingKey = '00112233445566778899aabbccddeeff'
  const rawBody = Buffer.from('{"method":"otl.course.search"}')

  it('accepts a matching base64 HMAC-SHA256 signature', () => {
    const signature = createHmac('sha256', Buffer.from(signingKey, 'hex')).update(rawBody).digest('base64')

    expect(verifyChannelTalkSignature(signature, signingKey, rawBody)).toBe(true)
  })

  it('rejects a signature after the raw body changes', () => {
    const signature = createHmac('sha256', Buffer.from(signingKey, 'hex')).update(rawBody).digest('base64')

    expect(verifyChannelTalkSignature(signature, signingKey, Buffer.from(`${rawBody.toString()} `))).toBe(false)
  })

  it('rejects malformed signing keys and signatures', () => {
    expect(verifyChannelTalkSignature('invalid', 'not-hex', rawBody)).toBe(false)
  })
})
