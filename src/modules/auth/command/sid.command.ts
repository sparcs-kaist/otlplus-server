import { AuthChain } from '../auth.chain';
import { Reflector } from '@nestjs/core';
import {
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { AuthCommand } from '../auth.command';

@Injectable()
export class SidCommand implements AuthCommand {
  constructor(
    private reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  public async next(
    context: ExecutionContext,
    prevResult: boolean,
  ): Promise<[boolean, boolean]> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const sid = request.cookies['auth-cookie'];
    if (sid) {
      const user = await this.authService.findBySid(sid);
      if (!user) {
        return Promise.resolve([prevResult, false]);
      }
      request['user'] = user;
      return Promise.resolve([true, true]);
    } else {
      return Promise.resolve([prevResult, false]);
    }
  }
}
