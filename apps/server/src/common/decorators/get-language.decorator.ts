import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const GetLanguage = createParamDecorator((_data, ctx: ExecutionContext): string => {
  const req = ctx.switchToHttp().getRequest()
  if (req.headers['accept-language']?.toString().lower() === 'en') return 'en'
  return 'kr'
})
