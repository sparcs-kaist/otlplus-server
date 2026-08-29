import { HttpException, HttpStatus } from '@nestjs/common'
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host'
import * as Sentry from '@sentry/node'

import logger from '../logger/logger'
import { HttpExceptionFilter, UnexpectedExceptionFilter } from './exception.filter'

jest.mock('@sentry/node', () => ({
  ...jest.requireActual('@sentry/node'),
  captureException: jest.fn(),
}))

describe('ChannelTalk exception reporting', () => {
  const setContext = jest.spyOn(Sentry.Scope.prototype, 'setContext')
  const setTag = jest.spyOn(Sentry.Scope.prototype, 'setTag')
  const logError = jest.spyOn(logger, 'error').mockImplementation()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it.each([
    ['unexpected errors', new UnexpectedExceptionFilter(), new Error('database unavailable')],
    ['HTTP errors', new HttpExceptionFilter(), new HttpException('unauthorized', HttpStatus.UNAUTHORIZED)],
  ])('redacts ChannelTalk request secrets from Sentry for %s', (_name, filter, exception) => {
    const request = {
      method: 'PUT',
      originalUrl: 'http://otl.example.com/FuNcTiOnS/v1?secret=query',
      url: '/FuNcTiOnS/v1?secret=query',
      body: {
        method: 'otl.course.search',
        params: { input: { keyword: 'secret query' } },
        context: { channel: { id: 'secret-channel' } },
        systemVersion: 'v1',
      },
      query: { secret: 'query-secret' },
      headers: {
        authorization: 'Bearer secret-token',
        cookie: 'session=secret-cookie',
        'x-signature': 'secret-signature',
      },
    }
    const response = {
      statusCode: 500,
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }
    const host = new ExecutionContextHost([request, response])

    filter.catch(exception, host)

    expect(setContext).toHaveBeenCalledWith('request', {
      method: 'PUT',
      url: 'http://otl.example.com/FuNcTiOnS/v1',
    })
    expect(setTag).toHaveBeenCalledWith('url', 'http://otl.example.com/FuNcTiOnS/v1')
    expect(logError).not.toHaveBeenCalledWith(expect.stringContaining('secret=query'))
  })
})
