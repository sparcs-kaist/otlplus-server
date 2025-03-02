import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IAuth } from '@otl/api-interface/src/interfaces';
import settings from '../../../settings';
import { AuthService } from '../auth.service';

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
