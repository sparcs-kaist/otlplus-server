import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from "../../user/user.service";
import settings from "../../../settings";


/*

@Todo
- reimplement JwtCookieStrategy because of the refreshToken
 */

@Injectable()
export class JwtCookieStrategy extends PassportStrategy(
  Strategy,
  'jwt-cookie',
) {
  constructor(
    private readonly authService: AuthService,
  ) {
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

  async validate(payload) {
    return this.authService.findBySid(payload.sid);
  }
}
