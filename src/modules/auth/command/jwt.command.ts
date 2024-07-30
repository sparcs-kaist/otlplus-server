import { AuthChain } from '../auth.chain';
import {
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import settings from '../../../settings';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { AuthCommand } from '../auth.command';

@Injectable()
export class JwtCommand implements AuthCommand {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}

  public async next(
    context: ExecutionContext,
    prevResult: boolean,
  ): Promise<[boolean, boolean]> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const accessToken = this.extractTokenFromCookie(request, 'accessToken');

    try {
      if (!accessToken) throw new Error('jwt expired');
      const payload = await this.jwtService.verify(accessToken, {
        secret: settings().getJwtConfig().secret,
      });
      const user = this.authService.findBySid(payload.sid);
      request['user'] = user;
      return [true, false];
    } catch (e: any) {
      if (e.message === 'jwt expired') {
        try {
          const refreshToken = this.extractTokenFromCookie(
            request,
            'refreshToken',
          );
          if (!refreshToken) throw new UnauthorizedException();
          const payload = await this.jwtService.verify(refreshToken, {
            secret: settings().getJwtConfig().secret,
          });
          const user = await this.authService.findBySid(payload.sid);
          if (!user) {
            throw new NotFoundException('user is not found');
          }
          if (
            user.refresh_token &&
            (await bcrypt.compare(refreshToken, user.refresh_token))
          ) {
            const { accessToken, ...accessTokenOptions } =
              this.authService.getCookieWithAccessToken(payload.sid);

            if (!request.res) {
              throw new InternalServerErrorException(
                'res property is not found in request',
              );
            }
            request.res.cookie('accessToken', accessToken, accessTokenOptions);
            request['user'] = user;
            return [true, false];
          }
          return [prevResult, false];
        } catch (e) {
          return [prevResult, false];
        }
      }
      return [prevResult, false];
    }
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
