import { ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { USE_ELASTICSEARCH_API_KEY } from '@otl/server-nest/common/decorators/elasticsearch-api-key-auth.decorator'
import settings from '@otl/server-nest/settings'

import { AuthCommand, AuthResult } from '../auth.command'

@Injectable()
export class ElasticsearchApiKeyCommand implements AuthCommand {
  constructor(private reflector: Reflector) {}

  public next(context: ExecutionContext, prevResult: AuthResult): Promise<AuthResult> {
    const useElasticsearchApiKey = this.reflector.getAllAndOverride<boolean>(USE_ELASTICSEARCH_API_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    // Use different header name to avoid conflict with @SyncApiKeyAuth()
    const apiKey = context.switchToHttp().getRequest().headers['x-elasticsearch-api-key']
    const realApiKey = settings().getElasticsearchConfig().apiKey

    if (useElasticsearchApiKey && realApiKey && apiKey === realApiKey) {
      return Promise.resolve({
        ...prevResult,
        authentication: true,
        authorization: true,
      })
    }
    return Promise.resolve(prevResult)
  }
}
