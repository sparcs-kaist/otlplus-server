import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const GetLanguage = createParamDecorator((_data, ctx: ExecutionContext): Language => {
  const req = ctx.switchToHttp().getRequest()
  const acceptLanguageHeader = req.headers['accept-language']

  if (typeof acceptLanguageHeader !== 'string' || !acceptLanguageHeader) {
    return 'ko'
  }

  const languages = acceptLanguageHeader.split(',').map((langPart) => langPart.trim().split(';')[0].toLowerCase())

  for (const lang of languages) {
    if (lang.startsWith('ko')) {
      return 'ko'
    }
    if (lang.startsWith('en')) {
      return 'en'
    }
  }

  return 'ko'
})

export type Language = 'en' | 'ko'
