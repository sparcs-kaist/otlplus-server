const INTERNAL_ORIGIN = 'http://internal'

export function withoutQuery(url: string): string {
  return url.split(/[?#]/, 1)[0]
}

export function isChannelTalkFunctionUrl(url: string): boolean {
  let pathname = withoutQuery(url)
  if (URL.canParse(url, INTERNAL_ORIGIN)) pathname = new URL(url, INTERNAL_ORIGIN).pathname

  const normalizedPathname = pathname.toLowerCase()
  return normalizedPathname === '/functions' || normalizedPathname.startsWith('/functions/')
}

export function redactRequestUrl(url: string): string {
  return isChannelTalkFunctionUrl(url) ? withoutQuery(url) : url
}
