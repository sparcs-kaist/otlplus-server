import {
  Controller,
  Get,
  Param,
  Query,
  Redirect,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('session')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @Redirect('./login/')
  home(): void {}

  @Get('login')
  user_login(
    @Query('next') next,
    @Query('social_login') social_login,
    @Req() req,
    @Res() res,
  ) {
    req.session['next'] = next ? req.param.next : '/';
    const social_login = social_login ? social_login : 0;
    /*let login_url,
      state = sso_client.get_login_params();
    if (social_login === 0) {
    }*/
  }
}
