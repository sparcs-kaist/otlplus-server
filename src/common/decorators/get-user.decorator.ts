import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { session_userprofile } from '@prisma/client';

export const GetUser = createParamDecorator(
  (data, ctx: ExecutionContext): session_userprofile => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
  },
);
