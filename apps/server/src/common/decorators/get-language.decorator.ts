import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const GetLanguage = createParamDecorator((_data, ctx: ExecutionContext): string => {
  const req = ctx.switchToHttp().getRequest()
  return req.headers['accept-language']?.toString() || 'kr'
})
