import {
  Body, Controller, Get, Post, Query, Req, Res, Session,
} from '@nestjs/common'
import { GetUser } from '@otl/server-nest/common/decorators/get-user.decorator'
import { Public } from '@otl/server-nest/common/decorators/skip-auth.decorator'
import { IAuth, IUser } from '@otl/server-nest/common/interfaces'
import settings from '@otl/server-nest/settings'
import { session_userprofile } from '@prisma/client'

import { ESSOUser } from '@otl/prisma-client/entities'

import { UserService } from '../user/user.service'
import { AuthService } from './auth.service'
import { Client } from './utils/sparcs-sso'

@Controller('session')
export class AuthController {
  private readonly ssoClient

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {
    const ssoConfig = settings().getSsoConfig()
    const ssoClient = new Client(ssoConfig.ssoClientId, ssoConfig.ssoSecretKey, ssoConfig.ssoIsBeta)
    this.ssoClient = ssoClient
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
      const accessToken = this.authService.extractTokenFromHeader(req, 'accessToken')
        ?? this.authService.extractTokenFromCookie(req, 'accessToken')
      const refreshToken = this.authService.extractTokenFromHeader(req, 'refreshToken')
        ?? this.authService.extractTokenFromCookie(req, 'refreshToken')
      return res.redirect(
        `${process.env.WEB_URL}/login/success#accessToken=${accessToken}&refreshToken=${refreshToken}`,
      )
    }
    // req.session['next'] = next ?? '/';
    res.cookie('next', next ?? '/', { httpOnly: true, secure: true, sameSite: 'strict' })
    const request_url = req.get('host') ?? 'otl.kaist.ac.kr'
    const { url, state } = this.ssoClient.get_login_params(request_url)
    res.cookie('sso_state', state, { httpOnly: true, secure: true, sameSite: 'strict' })
    // req.session['sso_state'] = state;
    if (social_login === '0') {
      return res.redirect(`${url}&social_enabled=0&show_disabled_button=0`)
    }
    return res.redirect(url)
  }

  @Public()
  @Get('login/callback')
  async loginCallback(
    @Query('state') state: string,
    @Query('code') code: string,
    @Req() req: IAuth.Request,
    @Session() session: Record<string, any>,
    @Res() response: IAuth.Response,
  ): Promise<void> {
    const ssoProfile: ESSOUser.SSOUser = await this.ssoClient.get_user_info(code)
    const {
      accessToken, accessTokenOptions, refreshToken, refreshTokenOptions,
    } = await this.authService.ssoLogin(ssoProfile)

    response.cookie('accessToken', accessToken, accessTokenOptions)
    response.cookie('refreshToken', refreshToken, refreshTokenOptions)

    /*
    @Todo
    call import_student_lectures(studentId)
     */
    const next_url = `${process.env.WEB_URL}/login/success#accessToken=${accessToken}&refreshToken=${refreshToken}`
    response.redirect(next_url)
  }

  @Public()
  @Post('refresh')
  async refreshToken(
    @Body() body: IUser.TokenDto,
    @Res({ passthrough: true }) res: IAuth.Response,
  ): Promise<IUser.TokenResponse> {
    const { token } = body
    const {
      accessToken, accessTokenOptions, refreshToken, refreshTokenOptions,
    } = await this.authService.tokenRefresh(token)
    res.cookie('accessToken', accessToken, accessTokenOptions)
    res.cookie('refreshToken', refreshToken, refreshTokenOptions)
    return {
      accessToken,
      refreshToken,
    }
  }

  @Get('info')
  async getUserProfile(@GetUser() user: session_userprofile): Promise<IUser.Profile> {
    /*
    @Todo
    implement userSerializer, before that, we'd like to architect the dto types
     */
    const profile = await this.userService.getProfile(user)
    return profile
  }

  @Public()
  @Get('/')
  async home(@Req() req: IAuth.Request, @Res() res: IAuth.Response): Promise<void> {
    return res.redirect('/session/login')
  }

  @Public()
  @Get('logout')
  async logout(
    @Req() req: IAuth.Request,
    @Res() res: IAuth.Response,
    @Query('next') next: string,
    @GetUser() user: session_userprofile,
  ): Promise<void> {
    const webURL = process.env.WEB_URL
    if (user) {
      const { sid } = user
      const { protocol } = req
      const host = req.get('host')
      const { originalUrl } = req
      const absoluteUrl = `${protocol}://${host}${originalUrl}`
      const logoutUrl = this.ssoClient.get_logout_url(sid, absoluteUrl)

      res.clearCookie('accessToken', { path: '/', maxAge: 0, httpOnly: true })
      res.clearCookie('refreshToken', { path: '/', maxAge: 0, httpOnly: true })
      res.clearCookie('sso_state', { path: '/', maxAge: 0, httpOnly: true })
      return res.redirect(logoutUrl)
    }

    return res.redirect(`${webURL}/`)
  }
}
