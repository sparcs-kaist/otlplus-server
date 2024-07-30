import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthCommand } from './auth.command';

@Injectable()
export class AuthChain {
  constructor(private readonly authChain: AuthCommand[]) {
    this.authChain = [];
  }

  public register(command: AuthCommand) {
    this.authChain.push(command);
    return this;
  }

  public async execute(context: ExecutionContext) {
    let result = false;
    let skip = false;
    for (const command of this.authChain) {
      try {
        [result, skip] = await command.next(context, result);
        if (skip) break;
      } catch (e) {
        console.log(e);
        console.log(command.constructor.name);
        throw new UnauthorizedException();
      }
    }
    if (!result) return false;
    return true;
  }
}
