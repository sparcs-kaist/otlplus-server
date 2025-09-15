import { ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { IS_PUBLIC_KEY } from '@otl/server-nest/common/decorators/skip-auth.decorator'
import { AuthService } from '@otl/server-nest/modules/auth/auth.service'

@Injectable()
export class JwtCookieGuard extends AuthGuard('jwt-cookie') {
  constructor(
    private reflector: Reflector,
    private readonly authService: AuthService,
  ) {
    super()
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) {
      return true
    }

    return super.canActivate(context)
  }
}
