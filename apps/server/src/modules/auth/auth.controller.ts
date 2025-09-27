import {
  Body, Controller, Get, Post, Query, Req, Res, Session,
} from '@nestjs/common'
import { GetUser } from '@otl/server-nest/common/decorators/get-user.decorator'
import { Public, Public as PublicForGuard } from '@otl/server-nest/common/decorators/skip-auth.decorator'
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
      const picked = accessToken ?? refreshToken
      if (!picked) {
        throw new Error('No token found for extracting sid and uid')
      }
      const { sid, uid } = this.authService.extractSidUidFromToken(picked, { allowExpired: true })
      if (sid && uid) {
        return res.redirect(
          `${process.env.WEB_URL}/login/success#accessToken=${accessToken}&refreshToken=${refreshToken}`,
        )
      }
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

    const user_db = await this.authService.findByUid(ssoProfile.uid)
    const user_db2 = await this.authService.findBySid(ssoProfile.sid)
    if (user_db && !user_db.sid) {
      await this.authService.updateUser(user_db.id, { sid: ssoProfile.sid })
    }
    if (user_db2 && !user_db2.uid) {
      await this.authService.updateUser(user_db2.id, { uid: ssoProfile.uid })
    }
    response.cookie('accessToken', accessToken, accessTokenOptions)
    response.cookie('refreshToken', refreshToken, refreshTokenOptions)

    /*
    @Todo
    call import_student_lectures(studentId)
     */
    const next_url = `${process.env.WEB_URL}/login/success#accessToken=${accessToken}&refreshToken=${refreshToken}`
    response.redirect(next_url)
  }

  @PublicForGuard()
  @Post('register-oneapp')
  async registerOneApp(
    @Body() body: IUser.sso_info_OneApp,
    @Req() req: IAuth.Request,
    @Res({ passthrough: true }) res: IAuth.Response,
  ) {
    const ignoreExp = false
    const now = Math.floor(Date.now() / 1000)
    const accessToken = this.authService.extractTokenFromHeader(req, 'accessToken')
    const authorization = accessToken ?? (req.headers.authorization as string) ?? ''

    // 1) Authorization 파싱
    if (!authorization) {
      res.status(401)
      return { isRegistered: false, mes: 'Missing or invalid Authorization header' }
    }
    const headerJwt = authorization

    type OneAppHeaderPayload = {
      oid: string
      uid: string
      type: string
      iat?: number
      exp?: number
      iss?: string
      aud?: string
    }
    type OneAppSsoPayload = {
      uid: string
      email?: string | null
      first_name?: string | null
      last_name?: string | null
      kaist_id?: string | null
      kaist_v2_info?: {
        std_no?: string | null
        std_dept_id?: string | number | null
        std_status_kor?: string | null
      } | null
      iat?: number
      exp?: number
      iss?: string
      aud?: string
    }

    // 2) 헤더 토큰 검증
    const headerPayload = await this.authService.verifyOneAppJwt<OneAppHeaderPayload>(headerJwt, {
      allowExpired: ignoreExp,
    })
    if (!ignoreExp && headerPayload.exp && now > headerPayload.exp) {
      res.status(401)
      return { isRegistered: false, mes: 'Authorization token expired' }
    }

    // 3) sso_info 검증
    if (!body?.sso_info) {
      res.status(401)
      return { isRegistered: false, mes: 'Missing sso_info' }
    }
    const ssoPayload = await this.authService.verifyOneAppJwt<OneAppSsoPayload>(body.sso_info, {
      allowExpired: ignoreExp,
    })
    if (!ignoreExp && ssoPayload.exp && now > ssoPayload.exp) {
      res.status(401)
      return { isRegistered: false, mes: 'sso_info token expired' }
    }

    // 4) uid 동일성
    if (!headerPayload?.uid || !ssoPayload?.uid || headerPayload.uid !== ssoPayload.uid) {
      res.status(401)
      return { isRegistered: false, mes: 'UID mismatch between Authorization and sso_info' }
    }

    // 4.5) 이미 존재하는 uid이면 바로 리턴
    const existed = await this.authService.findByUid(ssoPayload.uid)
    if (existed) {
      res.status(200)
      return { isRegistered: true, mes: 'UID already exists', uid: existed.uid }
      // 필요하면 reason 코드도 추가 가능: reason: 'already_exists'
    }

    // 5) 멱등 생성/갱신 (지금은 "새로 생성"만 일어남)
    const user = await this.authService.createOrMergeUserFromSsoInfo(ssoPayload)
    res.status(200)
    return { isRegistered: true, uid: user.uid }
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
    res.status(200)
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
