import { ExecutionContext, Injectable } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../../../common/decorators/skip-auth.decorator';
import { Reflector } from '@nestjs/core';
import { AuthCommand } from '../auth.command';

@Injectable()
export class IsPublicCommand implements AuthCommand {
  constructor(private reflector: Reflector) {}

  public next(
    context: ExecutionContext,
    prevResult: boolean,
  ): Promise<[boolean, boolean]> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return Promise.resolve([true, true]);
    }
    return Promise.resolve([prevResult, false]);
  }
}
