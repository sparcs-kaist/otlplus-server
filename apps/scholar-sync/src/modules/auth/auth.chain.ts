import { ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthCommand, AuthResult } from './auth.command';

@Injectable()
export class AuthChain {
  private authChain: AuthCommand[];

  constructor() {
    this.authChain = [];
  }

  public register(command: AuthCommand) {
    this.authChain.push(command);
    return this;
  }

  public async execute(context: ExecutionContext) {
    let result = {
      authorization: false,
      authentication: false,
      isPublic: false,
    };
    for (const command of this.authChain) {
      result = await command.next(context, result);
    }
    return this.handleException(result);
  }

  private async handleException(result: AuthResult) {
    if (result.isPublic) return true;
    else {
      if (!result.authentication) throw new UnauthorizedException();
      if (!result.authorization) throw new ForbiddenException();
      return true;
    }
  }
}
