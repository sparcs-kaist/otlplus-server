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
import { UserService } from "../user/user.service";

@Controller('session')
export class AuthController {

  private readonly ssoClient;

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {
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
    social_login = social_login ? social_login : 0;
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
    const sid = ssoProfile['sid'];

    let user = await this.authService.findBySid(sid);

    const kaistInfo = JSON.parse(ssoProfile['kaist_info']);
    const studentId = kaistInfo.get('ku_std_no') ?? "";


    if(!user){
      user = await this.authService.createUser(sid, ssoProfile['email'], studentId, ssoProfile['first_name'], ssoProfile['last_name']);
    }else{

      if(user.student_id != studentId){
        await this.userService.import_student_lectures(studentId);
      }

      const updateData = {
        first_name : ssoProfile['first_name'],
        last_name : ssoProfile['last_name'],
        student_id : studentId,
      }
      user = await this.authService.updateUser(user.id, updateData);
    }

    const {accessToken, ...accessTokenOptions } = this.authService.getCookieWithAccessToken(user)
    const {refreshToken, ...refreshTokenOptions } = this.authService.getCookieWithRefreshToken(user)
  }
}
