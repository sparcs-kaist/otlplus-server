import { ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { USE_SYNC_API_KEY } from '@otl/server-nest/common/decorators/sync-api-key-auth.decorator'
import settings from '@otl/server-nest/settings'

import { AuthCommand, AuthResult } from '../auth.command'

@Injectable()
export class SyncApiKeyCommand implements AuthCommand {
  constructor(private reflector: Reflector) {}

  public next(context: ExecutionContext, prevResult: AuthResult): Promise<AuthResult> {
    const useSyncApiKey = this.reflector.getAllAndOverride<boolean>(USE_SYNC_API_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    const apiKey = context.switchToHttp().getRequest().headers['x-api-key']
    const realApiKey = settings().syncConfig().apiKey

    if (useSyncApiKey && realApiKey && apiKey === realApiKey) {
      return Promise.resolve({
        ...prevResult,
        authentication: true,
        authorization: true,
      })
    }
    return Promise.resolve(prevResult)
  }
}
