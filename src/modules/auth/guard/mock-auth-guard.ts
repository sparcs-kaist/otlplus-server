import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../../../common/decorators/skip-auth.decorator";
import { Request } from "express";
import * as bcrypt from "bcrypt";
import { AuthService } from "../auth.service";
import { JwtService } from "@nestjs/jwt";
import settings from "../../../settings";

@Injectable()
export class MockAuthGuard implements CanActivate{
  constructor(
    private reflector: Reflector,
    private readonly authService: AuthService,
    private jwtService: JwtService
  ) {
  }

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const sid = request.cookies["auth-cookie"];
    if (sid) {
      const user = await this.authService.findBySid(sid);
      request["user"] = user;
      return true;
    }else{
      const accessToken = this.extractTokenFromCookie(request, "accessToken");
      try {
        if (!accessToken) throw new Error("jwt expired");
        const payload = await this.jwtService.verify(
          accessToken,
          {
            secret: settings().getJwtConfig().secret
          }
        );
        const user = this.authService.findBySid(payload.sid);
        request["user"] = user;
        return true;
      } catch (e) {
        if (e.message === "jwt expired") {
          const refreshToken = this.extractTokenFromCookie(request, "refreshToken");
          if (!refreshToken) throw new UnauthorizedException();
          try {
            const payload = await this.jwtService.verify(
              refreshToken,
              {
                secret: settings().getJwtConfig().secret
              }
            );
            const user = await this.authService.findBySid(payload.sid);
            if (await bcrypt.compare(refreshToken, user.refresh_token)) {
              const { accessToken, ...accessTokenOptions } = this.authService.getCookieWithAccessToken(payload.sid);
              request.res.cookie("accessToken", accessToken, accessTokenOptions);
              request["user"] = user;
              return true;
            }
            return false;
          } catch (e) {
            throw new UnauthorizedException();
          }
        }
        throw new UnauthorizedException();
      }
    }
  }

  private extractTokenFromCookie(request: Request, type: "accessToken" | "refreshToken"): string | undefined {
    const cookie = request.cookies[type];
    if (cookie) {
      return cookie;
    }
    return undefined;
  }
}
