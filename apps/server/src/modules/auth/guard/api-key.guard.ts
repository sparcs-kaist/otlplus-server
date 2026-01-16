import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { IS_PUBLIC_KEY } from '@otl/server-nest/common/decorators/skip-auth.decorator'
import { AuthService } from '@otl/server-nest/modules/auth/auth.service'

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const apiKey = this.extractApiKeyFromRequest(request)

    if (!apiKey) {
      throw new UnauthorizedException('API key is required')
    }

    const user = await this.authService.findUserByApiKey(apiKey)
    if (!user) {
      throw new UnauthorizedException('Invalid or expired API key')
    }

    request.user = user
    return true
  }

  private extractApiKeyFromRequest(request: any): string | null {
    // Check Authorization header: Bearer <api-key>
    const authHeader = request.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7)
    }

    // Check X-API-Key header
    const apiKeyHeader = request.headers['x-api-key']
    if (apiKeyHeader) {
      return apiKeyHeader
    }

    return null
  }
}
