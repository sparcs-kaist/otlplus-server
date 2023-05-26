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
import { Request, Response } from 'express';
import { Client } from './utils/sparcs-sso';
import settings from '../../settings';
import { UserService } from '../user/user.service';
import { Public } from '../../common/decorators/skip-auth.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { session_userprofile } from '@prisma/client';

@Controller('session')
export class AuthController {
  private readonly ssoClient;

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {
    const ssoConfig = settings().getSsoConfig();
    const ssoClient = new Client(
      ssoConfig.ssoClientId,
      ssoConfig.ssoSecretKey,
      ssoConfig.ssoIsBeta,
    );
    this.ssoClient = ssoClient;
  }

  @Public()
  @Get()
  @Redirect('./login/')
  home(): void {}

  @Public()
  @Get('login')
  user_login(
    @Query('next') next,
    @Query('social_login') social_login,
    @Req() req,
    @Res() res,
  ) {
    if (req.user && req.user.is_authenticated) {
      return res.redirect(next ?? '/');
    }
    req.session['next'] = next ?? '/';
    social_login = social_login ?? null;
    let [login_url, state] = this.ssoClient.get_login_params();
    if (social_login === '0') {
      login_url += '&social_enabled=0&show_disabled_button=0';
    }
    req.session['sso_state'] = state;
    return res.redirect(login_url);
  }

  @Public()
  @Get('login/callback')
  async loginCallback(@Req() request: Request, @Res() response: Response) {
    const session: any = request.session;
    const stateBefore = session.sso_state ?? null;
    const state = request.query.state ?? null;
    if (!stateBefore || stateBefore != state) {
      response.redirect('/error/invalid-login');
    }

    const code = request.query.code ?? null;
    const ssoProfile = this.ssoClient.get_user_info(code);
    const sid = ssoProfile['sid'];

    let user = await this.authService.findBySid(sid);

    const kaistInfo = JSON.parse(ssoProfile['kaist_info']);
    const studentId = kaistInfo.get('ku_std_no') ?? '';

    if (!user) {
      user = await this.authService.createUser(
        sid,
        ssoProfile['email'],
        studentId,
        ssoProfile['first_name'],
        ssoProfile['last_name'],
      );
    } else {
      if (user.student_id != studentId) {
        await this.userService.import_student_lectures(studentId);
      }

      const updateData = {
        first_name: ssoProfile['first_name'],
        last_name: ssoProfile['last_name'],
        student_id: studentId,
      };
      user = await this.authService.updateUser(user.id, updateData);
    }

    const { accessToken, ...accessTokenOptions } =
      this.authService.getCookieWithAccessToken(user);
    const { refreshToken, ...refreshTokenOptions } =
      this.authService.getCookieWithRefreshToken(user);

    /*
    @Todo
    response.cookie('accessToken', accessToken, accessTokenOptions);
    response.cookie('refreshToken', refreshToken, refreshTokenOptions);
    */

    /*
    @Todo
    call import_student_lectures(studentId)
     */

    /*
    @Todo
    save refreshToken in session_userprofile
     */
  }

  @Get('info')
  async getUserProfile(@GetUser() user: session_userprofile) {
    /*
    @Todo
    implement userSerializer, before that, we'd like to architect the dto types
     */
  }
}
