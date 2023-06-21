import { AuthGuard } from "@nestjs/passport";
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../../../common/decorators/skip-auth.decorator";
import { Request } from "express";
import { AuthService } from "../auth.service";
import { JwtService } from "@nestjs/jwt";
import settings from "../../../settings";

@Injectable()
export class MockAuthGuard implements CanActivate{
  constructor(
    private reflector: Reflector,
    private readonly authService: AuthService,
    private jwtService: JwtService){
  }

  async canActivate(context: ExecutionContext) {
    console.log("???")
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const sid = request.cookies["auth-cookie"];
    if (sid) {
      const payload = await this.authService.findBySid(sid);
      request["user"] = payload;
      console.log(payload)
      return true;
    }else{

      const accessToken = this.extractTokenFromCookie(request);
      console.log(accessToken)
      if(!accessToken) throw new UnauthorizedException();
      try{
        const payload = await this.jwtService.verifyAsync(
          accessToken,
          {
            secret: settings().getJwtConfig().secret
          }
        )
        console.log(payload)
        const user = this.authService.findBySid(payload.sid);
        console.log(user)
        request["user"] = user;
        return true;
      }catch (e) {
        throw new UnauthorizedException()
      }
    }
  }

  private extractTokenFromCookie(request: Request): string | undefined{
    const cookie = request.cookies["accessToken"];
    if(cookie){
      return cookie;
    }
    return undefined;
  }
}
