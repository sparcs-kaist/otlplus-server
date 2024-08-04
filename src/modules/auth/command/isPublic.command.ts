import { ExecutionContext, Injectable } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../../../common/decorators/skip-auth.decorator';
import { Reflector } from '@nestjs/core';
import { AuthCommand, AuthResult } from '../auth.command';

@Injectable()
export class IsPublicCommand implements AuthCommand {
  constructor(private reflector: Reflector) {}

  public next(
    context: ExecutionContext,
    prevResult: AuthResult,
  ): Promise<AuthResult> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      prevResult.isPublic = true;
      return Promise.resolve(prevResult);
    }
    return Promise.resolve(prevResult);
  }
}
