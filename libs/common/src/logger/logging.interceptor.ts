import {
  CallHandler, ExecutionContext, Injectable, NestInterceptor,
} from '@nestjs/common'
import { Response } from 'express'
import {
  catchError, Observable, tap, throwError,
} from 'rxjs'

import logger from '@otl/common/logger/logger'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept<T>(context: ExecutionContext, next: CallHandler<T>): Observable<T> {
    const now = Date.now()

    const request = context.switchToHttp().getRequest()
    const response = context.switchToHttp().getResponse<Response>()

    const { method } = request
    const url = request.originalUrl || request.url
    const clientOs = request.headers['client-os'] || '-'
    const apiVersion = request.headers['client-api-version'] || '-'
    const userId = request?.user?.id ?? 'Anonymous'

    return next.handle().pipe(
      tap(() => {
        const delay = Date.now() - now
        const { statusCode } = response

        const logMessage = `[User#${userId}] ${method} ${url} OS/${clientOs} Ver/${apiVersion} → ${statusCode} (${delay}ms)`

        logger.info(logMessage)
      }),
      catchError((err) => {
        const delay = Date.now() - now
        const statusCode = response.statusCode ?? 500
        const logMessage = `[User#${userId}] ${method} ${url} OS/${clientOs} Ver/${apiVersion} → ERROR ${statusCode} (${delay}ms): ${err.message}`
        logger.error(logMessage)
        return throwError(() => err)
      }),
    )
  }
}
