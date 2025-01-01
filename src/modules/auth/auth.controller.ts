import { Controller, Get, Query, Req, Res, Session } from '@nestjs/common';
import { session_userprofile } from '@prisma/client';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { ESSOUser } from 'src/common/entities/ESSOUser';
import { IAuth } from 'src/common/interfaces';
import { IUser } from 'src/common/interfaces/IUser';
import { Public } from '../../common/decorators/skip-auth.decorator';
import settings from '../../settings';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { Client } from './utils/sparcs-sso';
import { request } from 'http';

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
  @Get('login')
  user_login(
    @Query('next') next: string,
    @Query('social_login') social_login: string,
    @Req() req: IAuth.Request,
    @Res() res: IAuth.Response,
  ): void {
    if (req.user) {
      return res.redirect(next ?? '/');
    }
    req.session['next'] = next ?? '/';
    const request_url = req.get('host') ?? 'otl.kaist.ac.kr';
    console.log(request_url);
    const { url, state } = this.ssoClient.get_login_params(request_url);
    req.session['sso_state'] = state;
    if (social_login === '0') {
      return res.redirect(url + '&social_enabled=0&show_disabled_button=0');
    }
    return res.redirect(url);
  }

  @Public()
  @Get('login/callback')
  async loginCallback(
    @Query('state') state: string,
    @Query('code') code: string,
    @Session() session: Record<string, any>,
    @Res() response: IAuth.Response,
  ): Promise<void> {
    const stateBefore = session['sso_state'];
    if (!stateBefore || stateBefore != state) {
      response.redirect('/error/invalid-login');
    }
    const ssoProfile: ESSOUser.SSOUser = await this.ssoClient.get_user_info(
      code,
    );
    const {
      accessToken,
      accessTokenOptions,
      refreshToken,
      refreshTokenOptions,
    } = await this.authService.ssoLogin(ssoProfile);

    response.cookie('accessToken', accessToken, accessTokenOptions);
    response.cookie('refreshToken', refreshToken, refreshTokenOptions);

    /*
    @Todo
    call import_student_lectures(studentId)
     */

    const next_url = session['next'] ?? '/';
    response.redirect(next_url);
  }

  @Get('info')
  async getUserProfile(
    @GetUser() user: session_userprofile,
  ): Promise<IUser.Profile> {
    /*
    @Todo
    implement userSerializer, before that, we'd like to architect the dto types
     */
    const profile = await this.userService.getProfile(user);
    return profile;
  }

  @Public()
  @Get('/')
  async home(
    @Req() req: IAuth.Request,
    @Res() res: IAuth.Response,
  ): Promise<void> {
    return res.redirect('/session/login');
  }

  @Public()
  @Get('logout')
  async logout(
    @Req() req: IAuth.Request,
    @Res() res: IAuth.Response,
    @Query('next') next: string,
    @GetUser() user: session_userprofile,
  ): Promise<void> {
    const webURL = process.env.WEB_URL;
    if (user) {
      const sid = user.sid;
      const protocol = req.protocol;
      const host = req.get('host');
      const originalUrl = req.originalUrl;
      const absoluteUrl = `${protocol}://${host}${originalUrl}`;
      const logoutUrl = this.ssoClient.get_logout_url(sid, absoluteUrl);

      res.clearCookie('accessToken', { path: '/', maxAge: 0, httpOnly: true });
      res.clearCookie('refreshToken', { path: '/', maxAge: 0, httpOnly: true });

      return res.redirect(logoutUrl);
    }

    return res.redirect(webURL + '/');
  }
}
