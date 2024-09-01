import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { AuthCommand, AuthResult } from '../auth.command';

@Injectable()
export class SessionCommand implements AuthCommand {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}

  public async next(
    context: ExecutionContext,
    prevResult: AuthResult,
  ): Promise<AuthResult> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const accessToken = this.extractTokenFromCookie(request, 'accessToken');
    const cookie = request.cookies['sessionid'];
    if (!cookie) {
      return prevResult;
    }
    const user = await this.authService.findBySessionKey(cookie);
    request['user'] = user;
    prevResult.authentication = true;
    prevResult.authorization = true;
    return prevResult;
  }

  private extractTokenFromCookie(
    request: Request,
    type: 'accessToken' | 'refreshToken',
  ): string | undefined {
    const cookie = request.cookies[type];
    if (cookie) {
      return cookie;
    }
    return undefined;
  }
}
