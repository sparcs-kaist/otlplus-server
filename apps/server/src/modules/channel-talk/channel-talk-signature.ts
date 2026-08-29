import { createHmac, timingSafeEqual } from 'crypto'

export function verifyChannelTalkSignature(signature: string, signingKey: string, rawBody: Buffer): boolean {
  if (signingKey.length === 0 || signingKey.length % 2 !== 0 || !/^[0-9a-f]+$/i.test(signingKey)) {
    return false
  }

  const expected = createHmac('sha256', Buffer.from(signingKey, 'hex')).update(rawBody).digest('base64')
  const actualBuffer = Buffer.from(signature, 'utf8')
  const expectedBuffer = Buffer.from(expected, 'utf8')
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer)
}
