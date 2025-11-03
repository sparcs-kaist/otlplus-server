import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const GetLanguage = createParamDecorator((_data, ctx: ExecutionContext): 'en' | 'kr' => {
  const req = ctx.switchToHttp().getRequest()
  const acceptLanguageHeader = req.headers['accept-language']

  if (typeof acceptLanguageHeader !== 'string' || !acceptLanguageHeader) {
    return 'kr'
  }

  const languages = acceptLanguageHeader.split(',').map((langPart) => langPart.trim().split(';')[0].toLowerCase())

  if (languages.some((lang) => lang.startsWith('en'))) {
    return 'en'
  }

  return 'kr'
})
