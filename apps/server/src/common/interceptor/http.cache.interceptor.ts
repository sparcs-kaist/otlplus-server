import { CacheInterceptor } from '@nestjs/cache-manager'
import { ExecutionContext, Injectable } from '@nestjs/common'

/**
 * @Todo
 * 예시로 일단 인터넷에 있는거 긁어온거임.
 * 적절히 구현 변형 필요
 */

const excludePaths = [
  // 캐시가 적용되지 않아야 할 path 목록 ()
  /(\/sample2\/)(.*)/i,
]

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest()
    const { query } = request
    const { httpAdapter } = this.httpAdapterHost

    // Get Request가 아닌 request 처리
    const isGetRequest = httpAdapter.getRequestMethod(request) === 'GET'
    if (!isGetRequest) {
      return undefined
    }

    // noCache=true query parameter 처리
    const noCache = query.noCache && query.noCache.toLowerCase() === 'true'
    if (noCache) {
      return undefined
    }

    // 설정된 캐시 예외 path 처리
    const requestPath = httpAdapter.getRequestUrl(request).split('?')[0]
    const exclude = excludePaths.find((path) => path.test(requestPath))
    if (exclude) {
      return undefined
    }

    return httpAdapter.getRequestUrl(request)
  }
}
