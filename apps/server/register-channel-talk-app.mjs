import { NativeFunctionClient } from '@channel.io/app-sdk-server'

function required(name) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name} is required`)
  return value
}

const appId = required('CHANNELTALK_APP_ID')
const appSecret = required('CHANNELTALK_APP_SECRET')
const appStoreUrl = process.env.CHANNELTALK_APP_STORE_URL ?? 'https://app-store.channel.io'
const client = new NativeFunctionClient({ appStoreUrl })

const token = await client.issueToken(appSecret)
const result = await client.registerExtension(appId, 'command', 'v1', token.accessToken)

if (!result.success) {
  const detail = result.errorMessage ?? result.validationErrors?.join(', ') ?? 'unknown error'
  throw new Error(`ChannelTalk command extension registration failed: ${detail}`)
}

console.log(`Registered ChannelTalk command extension for app ${appId}`)
