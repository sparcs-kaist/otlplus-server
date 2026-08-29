import type { CallHandler, ExecutionContext } from '@nestjs/common'
import { firstValueFrom, of } from 'rxjs'

import logger from './logger'
import { LoggingInterceptor } from './logging.interceptor'

describe('LoggingInterceptor', () => {
  it('removes query strings from ChannelTalk request logs', async () => {
    const logInfo = jest.spyOn(logger, 'info').mockImplementation()
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'PUT',
          originalUrl: 'http://otl.example.com/FuNcTiOnS/v1?secret=query',
          url: '/FuNcTiOnS/v1?secret=query',
          headers: {},
        }),
        getResponse: () => ({ statusCode: 200 }),
      }),
    } as ExecutionContext
    const next = { handle: () => of(undefined) } as CallHandler

    await firstValueFrom(new LoggingInterceptor().intercept(context, next))

    expect(logInfo).toHaveBeenCalledWith(expect.stringContaining('http://otl.example.com/FuNcTiOnS/v1 '))
    expect(logInfo).not.toHaveBeenCalledWith(expect.stringContaining('secret=query'))
  })
})
