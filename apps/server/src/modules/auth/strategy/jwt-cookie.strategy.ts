import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '@otl/server-nest/modules/auth/auth.service';
import settings from '@otl/server-nest/settings';
import { IAuth } from '@otl/server-nest/common/interfaces';

/*

@Todo
- reimplement JwtCookieStrategy because of the refreshToken
 */

@Injectable()
export class JwtCookieStrategy extends PassportStrategy(Strategy, 'jwt-cookie') {
  constructor(private readonly authService: AuthService) {
    super({
      secretOrKey: settings().getJwtConfig().secret,
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          return request?.cookies?.accessToken;
        },
      ]),
    });
  }

  async validate(payload: IAuth.JwtPayload) {
    return this.authService.findBySid(payload.sid);
  }
}
