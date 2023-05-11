import { AuthGuard } from "@nestjs/passport";
import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../../../common/decorators/skip-auth.decorator";
import { Request } from "express";
import { AuthService } from "../auth.service";

@Injectable()
export class JwtCookieGuard extends AuthGuard("jwt-cookie") {
  constructor(
    private reflector: Reflector,
    private readonly authService: AuthService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    if (isPublic) {
      return true;
    }

    if(process.env.NODE_ENV!=='production'){
      return this.mockAuth(context);
    }

    return super.canActivate(context);
  }

  private mockAuth(context: ExecutionContext){
    const request = context.switchToHttp().getRequest<Request>();
    const sid = request.cookies["auth-cookie"];

    if (sid) {
      const payload = this.authService.findBySid(sid);
      request["user"] = payload;
      return true;
    }
  }
}
