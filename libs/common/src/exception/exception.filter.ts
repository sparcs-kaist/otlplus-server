import {
  ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus,
} from '@nestjs/common'
import { SentryExceptionCaptured } from '@sentry/nestjs'

import logger from '../logger/logger'

@Catch() // BaseException을 상속한 exception에 대해서 실행됨.
export class UnexpectedExceptionFilter implements ExceptionFilter {
  @SentryExceptionCaptured()
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()

    const resStatus = HttpStatus.INTERNAL_SERVER_ERROR
    logger.error('Unexpected exception', exception)
    logger.error(exception)
    //
    response.status(resStatus).json({
      // todo: exception의 response 형식 결정되면 변경해야함.
      statusCode: resStatus,
      timestamp: new Date().toISOString(),
      path: request.url,
    })
  }
}

@Catch(HttpException) // BaseException을 상속한 exception에 대해서 실행됨.
export class HttpExceptionFilter<T extends HttpException> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()

    const resStatus = exception.getStatus()
    logger.error(exception.getResponse())
    response.status(resStatus).json({
      // todo: exception의 response 형식 결정되면 변경해야함.
      message: exception.getResponse(), // test를 위한 코드
      statusCode: resStatus,
      timestamp: new Date().toISOString(),
      path: request.url,
    })
  }
}
