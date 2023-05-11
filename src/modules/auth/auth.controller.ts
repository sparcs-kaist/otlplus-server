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
import { Request, Response} from "express";
import { Client } from "./utils/sparcs-sso";
import settings from "../../settings";

@Controller('session')
export class AuthController {

  private readonly ssoClient;

  constructor(private readonly authService: AuthService) {
    const ssoConfig = settings().getSsoConfig();
    const ssoClient = new Client(ssoConfig.ssoClientId, ssoConfig.ssoSecretKey, ssoConfig.ssoIsBeta)
    this.ssoClient = ssoClient;
  }

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

  @Get('login/callback')
  async loginCallback(@Req() request: Request, @Res() response: Response){
    const session:any = request.session
    const stateBefore = session.sso_state ?? null;
    const state = request.query.state ?? null;
    if (!stateBefore || stateBefore != state){
      response.redirect('/error/invalid-login')
    }

    const code = request.query.code ?? null;
    const ssoProfile = this.ssoClient.get_user_info(code);

  }


  @
}
