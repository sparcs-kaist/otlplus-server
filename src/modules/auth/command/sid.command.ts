import { AuthChain } from '../auth.chain';
import { Reflector } from '@nestjs/core';
import {
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { AuthCommand, AuthResult } from '../auth.command';

@Injectable()
export class SidCommand implements AuthCommand {
  constructor(
    private reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  public async next(
    context: ExecutionContext,
    prevResult: AuthResult,
  ): Promise<AuthResult> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const sid = request.cookies['auth-cookie'];
    if (sid) {
      const user = await this.authService.findBySid(sid);
      if (!user) {
        return Promise.resolve(prevResult);
      }
      request['user'] = user;
      prevResult.authentication = true;
      prevResult.authorization = true;
      return Promise.resolve(prevResult);
    } else {
      return Promise.resolve(prevResult);
    }
  }
}
