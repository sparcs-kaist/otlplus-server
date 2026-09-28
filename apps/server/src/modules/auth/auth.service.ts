import {
  Inject, Injectable, UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { IAuth } from '@otl/server-nest/common/interfaces'
import { AGREEMENT_IN_PUBLIC_PORT } from '@otl/server-nest/modules/agreement/domain/agreement.in.port'
import { AgreementInPublicPort } from '@otl/server-nest/modules/agreement/domain/agreement.in.public.port'
import { UserNotificationCreate } from '@otl/server-nest/modules/notification/domain/notification'
import settings from '@otl/server-nest/settings'
import { Prisma, session_auth_session, session_userprofile } from '@prisma/client'
import { Request, Response } from 'express'
import * as jsonwebtoken from 'jsonwebtoken'

import { AgreementType } from '@otl/common/enum/agreement'

import { ESSOUser } from '@otl/prisma-client/entities/ESSOUser'
import { UserRepository } from '@otl/prisma-client/repositories'
import { AuthSessionRepository, REFRESH_RETRY_SECONDS } from '@otl/prisma-client/repositories/auth-session.repository'
import { NotificationPrismaRepository } from '@otl/prisma-client/repositories/notification.repository'

import { SyncTakenLectureService } from '../sync/syncTakenLecture.service'

type SessionTokenPayload = {
  sid: string
  sessionId: string
  tokenUse: 'access' | 'refresh'
  version: number
  iat: number
  exp: number
}

@Injectable()
export class AuthService {
  private readonly jwtConfig = settings().getJwtConfig()

  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly syncTakenLecturesService: SyncTakenLectureService,
    private readonly notificationRepository: NotificationPrismaRepository,
    @Inject(AGREEMENT_IN_PUBLIC_PORT)
    private readonly agreementService: AgreementInPublicPort,
    private readonly authSessions: AuthSessionRepository,
  ) {}

  public async findBySid(sid: string) {
    return this.userRepository.findBySid(sid)
  }

  public async findByUid(uid: string) {
    return this.userRepository.findByUid(uid)
  }

  public async findByStudentId(studentId: number) {
    return this.userRepository.findByStudentId(studentId)
  }

  async findSidByUid(uid: string): Promise<string | null> {
    const sid = await this.userRepository.findSidByUid(uid)
    return sid
  }

  async CreateUserFromSsoInfo(sso: IAuth.SsoPayload): Promise<session_userprofile> {
    // oneapp에서 사용
    const { uid } = sso
    if (!uid) throw new UnauthorizedException('Missing uid in sso_info payload')

    const existed = await this.userRepository.findByUid(uid)

    // kaist_v2_info에서 기존 ssoLogin 규칙을 그대로 반영
    const v2 = sso.kaist_v2_info ?? null
    const rawDegree = sso.kaist_v2_info?.std_prog_code ?? sso.kaist_info?.ku_acad_prog_code ?? null
    let degree: string | null = null
    const degreeNum = rawDegree !== null ? Number(rawDegree) : null
    if (degreeNum === 0) {
      degree = '학사과정'
    }
    else if (degreeNum === 1) {
      degree = '석사과정'
    }
    else if (degreeNum === 2) {
      degree = '박사과정'
    }
    const studentId = (v2?.std_no ?? '') as string
    const departmentId = v2?.std_dept_id != null && v2?.std_dept_id !== '' ? Number(v2.std_dept_id) : undefined
    const status = (v2?.std_status_kor ?? null) as string | null

    const baseData: Prisma.session_userprofileCreateInput = {
      uid, // 멱등 키
      sid: '', // 요구사항: sid는 null
      student_id: studentId ?? '', // 없으면 빈 문자열
      first_name: sso.first_name ?? '',
      last_name: sso.last_name ?? '',
      email: sso.email ?? null,
      language: 'ko',
      status, // null 허용
      kaist_id: sso.kaist_id ?? null,
      last_login: new Date(),
      date_joined: new Date(),
      refresh_token: null,
      degree,
      // 관계들은 생략(필요시 나중에 채움)
      // department는 스키마가 nullable/옵션이므로 값 있을 때만 설정
      ...(departmentId
        ? {
          department: {
            connect: { id: departmentId },
          },
        }
        : {}),
    }

    if (!existed) {
      // 신규 생성
      return await this.userRepository.createUser(baseData)
    }

    // 갱신(필요한 필드만 업데이트)
    const updateData: Prisma.session_userprofileUpdateInput = {
      first_name: baseData.first_name,
      last_name: baseData.last_name,
      student_id: baseData.student_id,
      status: baseData.status,
      kaist_id: baseData.kaist_id,
      last_login: baseData.last_login,
      email: baseData.email,
      language: baseData.language,
      degree: baseData.degree,
      // sid는 null 유지 (이 엔드포인트에서는 sid를 건드리지 않음)
      ...(departmentId ? { department: { connect: { id: departmentId } } } : {}), // 값이 없으면 부서 갱신 스킵
    }

    // userRepo에 updateById 같은 메서드가 없다면, prisma 직접 접근 메서드 추가해도 됨
    return await this.userRepository.updateUser(existed.id, updateData)
  }

  // (교체) 외부 토큰 검증: HS256 가정(= secret 동일) + 만료만 무시 옵션 + 디코드 폴백(개발)
  async verifyOneAppJwt<T extends object = any>(
    token: string,
    {
      allowExpired = false,
      allowDecodeFallback = process.env.NODE_ENV !== 'prod',
    }: { allowExpired?: boolean, allowDecodeFallback?: boolean } = {},
  ): Promise<T> {
    const { oneAppSecret } = settings().getJwtConfig()

    // 1) alg 확인 (헤더만 먼저 디코드, verify 미수행)
    const decodedComplete = jsonwebtoken.decode(token, { complete: true }) as { header?: any } | null
    const alg = decodedComplete?.header?.alg

    try {
      // 2) HS*면 secret로 바로 검증(전역 verifyOptions 무시)
      if (!alg || /^HS\d+$/i.test(alg)) {
        return jsonwebtoken.verify(token, oneAppSecret ?? '', {
          ignoreExpiration: false, // 우선 정상 경로
          algorithms: ['HS256', 'HS384', 'HS512'],
        }) as unknown as T
      }

      // 3) RS*면, (있다면) JWKS/공개키 경로로 검증하도록 여기에 추가 가능
      //    -> settings().getSsoVerifyConfig() 기반으로 jose jwtVerify 사용
      //    지금은 필요없다면 아래로 진행
      throw new Error('ALG_MISMATCH_OR_RS_ALG')
    }
    catch (e: any) {
      // 만료만 무시
      if (allowExpired && (e?.name === 'TokenExpiredError' || /expired|exp|jwt expired/i.test(e?.message))) {
        if (!alg || /^HS\d+$/i.test(alg)) {
          return jsonwebtoken.verify(token, oneAppSecret ?? '', {
            ignoreExpiration: true,
            algorithms: ['HS256', 'HS384', 'HS512'],
          }) as unknown as T
        }
        // RS* 인데 만료만 무시하고 싶은 경우: jose로 검증하면서 exp 스킵은 어려워서 decode 폴백으로 처리
      }

      // 개발용 폴백(서명검증 없이 페이로드만 디코드)
      if (allowDecodeFallback) {
        const payloadOnly = jsonwebtoken.decode(token) as T | null
        if (payloadOnly && typeof payloadOnly === 'object') return payloadOnly
      }

      throw new UnauthorizedException('Invalid token')
    }
  }

  public async ssoLogin(ssoProfile: ESSOUser.SSOUser) {
    const { sid, uid, kaist_id } = ssoProfile
    const status = ssoProfile.kaist_v2_info.std_status_kor ?? null
    let user = await this.findBySid(sid)
    if (!user) {
      user = await this.findByUid(uid)
    }

    // const kaistInfo = ssoProfile.kaist_info
    const kaistInfo = ssoProfile.kaist_v2_info
    const studentId = kaistInfo.std_no ?? ''
    const departmentId = kaistInfo.std_dept_id ? Number(kaistInfo.std_dept_id) : undefined

    const rawDegree = ssoProfile.kaist_v2_info?.std_prog_code ?? ssoProfile.kaist_info?.ku_acad_prog_code ?? null
    let degree: string | null = null
    const degreeNum = rawDegree !== null ? Number(rawDegree) : null
    if (degreeNum === 0) {
      degree = '학사과정'
    }
    else if (degreeNum === 1) {
      degree = '석사과정'
    }
    else if (degreeNum === 2) {
      degree = '박사과정'
    }

    if (!user) {
      user = await this.createUser(
        uid,
        sid,
        ssoProfile.email,
        studentId,
        ssoProfile.first_name,
        ssoProfile.last_name,
        departmentId,
        status,
        kaist_id,
        degree,
      )
      await this.syncTakenLecturesService.repopulateTakenLectureForStudent(user.id)
    }
    else {
      const prev_student_id = user.student_id
      const updateData = {
        email: ssoProfile.email,
        first_name: ssoProfile.first_name,
        last_name: ssoProfile.last_name,
        student_id: studentId,
        // department_id: departmentId,
        status,
        kaist_id,
        last_login: new Date(),
        refresh_token: null,
        degree,
      }
      user = await this.updateUser(user.id, updateData)
      if (prev_student_id !== studentId) {
        await this.syncTakenLecturesService.repopulateTakenLectureForStudent(user.id)
      }
    }

    const userNotifications = await this.notificationRepository.findByUserId(user.id)
    const notificationTypes = await this.notificationRepository.getAllNotification()
    if (!userNotifications || userNotifications.length !== notificationTypes.length) {
      const userNotificationCreates: UserNotificationCreate[] = notificationTypes.map((n) => {
        let active = false
        if (n.agreementType === AgreementType.INFO) {
          active = true
        }
        return {
          notificationId: n.id,
          userId: user.id,
          notificationName: n.name,
          active,
        }
      })
      await this.notificationRepository.upsertMany(userNotificationCreates)
    }
    await this.agreementService.initialize(user.id)

    return this.createSession({ id: user.id, sid })
  }

  private tokenLifetime(tokenUse: 'access' | 'refresh') {
    const seconds = Number(tokenUse === 'access'
      ? this.jwtConfig.signOptions.expiresIn
      : this.jwtConfig.signOptions.refreshExpiresIn)
    if (!Number.isSafeInteger(seconds) || seconds <= REFRESH_RETRY_SECONDS) {
      throw new Error(`${tokenUse} token lifetime must exceed ${REFRESH_RETRY_SECONDS} seconds`)
    }
    return seconds
  }

  async createSession(user: Pick<session_userprofile, 'id' | 'sid'>) {
    if (!user.sid) throw new UnauthorizedException('Missing user sid')
    this.tokenLifetime('access')
    const session = await this.authSessions.create(user.id, this.tokenLifetime('refresh'))
    return this.tokensForSession(user.sid, session)
  }

  private tokensForSession(sid: string, session: session_auth_session) {
    const iat = Math.floor(session.issued_at.getTime() / 1000)
    const accessExp = iat + this.tokenLifetime('access')
    const refreshExp = Math.floor(session.expires_at.getTime() / 1000)
    const payload = {
      sid, sessionId: session.id, version: session.version, iat,
    }
    const options = {
      path: '/', httpOnly: true, sameSite: 'none' as const, secure: true,
    }
    return {
      accessToken: this.jwtService.sign({ ...payload, tokenUse: 'access', exp: accessExp }, {
        secret: this.jwtConfig.secret, algorithm: 'HS256',
      }),
      refreshToken: this.jwtService.sign({ ...payload, tokenUse: 'refresh', exp: refreshExp }, {
        secret: this.jwtConfig.secret, algorithm: 'HS256',
      }),
      accessTokenOptions: { ...options, maxAge: Math.max(0, accessExp * 1000 - Date.now()) },
      refreshTokenOptions: { ...options, maxAge: Math.max(0, refreshExp * 1000 - Date.now()) },
    }
  }

  private verifySessionToken(token: unknown, tokenUse: 'access' | 'refresh', ignoreExpiration = false): SessionTokenPayload {
    try {
      if (typeof token !== 'string' || !token) throw new Error('Missing token')
      const payload = this.jwtService.verify<SessionTokenPayload>(token, {
        secret: this.jwtConfig.secret, algorithms: ['HS256'], ignoreExpiration,
      })
      if (payload.tokenUse !== tokenUse || typeof payload.sid !== 'string' || !payload.sid
        || typeof payload.sessionId !== 'string'
        || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(payload.sessionId)
        || !Number.isSafeInteger(payload.version) || payload.version < 0
        || !Number.isSafeInteger(payload.iat) || !Number.isSafeInteger(payload.exp)
        || payload.exp <= payload.iat) {
        throw new Error('Invalid token claims')
      }
      return payload
    }
    catch {
      throw new UnauthorizedException('Invalid or expired token')
    }
  }

  verifyAccessToken(token: unknown) {
    return this.verifySessionToken(token, 'access')
  }

  async authenticateTokens(accessToken: unknown, refreshToken: unknown, response: Response) {
    let payload: SessionTokenPayload | undefined
    try {
      payload = this.verifyAccessToken(accessToken)
    }
    catch (error) {
      if (!(error instanceof UnauthorizedException)) throw error
    }
    if (payload) return this.findBySid(payload.sid)
    if (!refreshToken) return null

    try {
      const tokens = await this.tokenRefresh(refreshToken)
      response.cookie('accessToken', tokens.accessToken, tokens.accessTokenOptions)
      response.cookie('refreshToken', tokens.refreshToken, tokens.refreshTokenOptions)
      return this.findBySid(this.verifyAccessToken(tokens.accessToken).sid)
    }
    catch (error) {
      if (!(error instanceof UnauthorizedException)) throw error
      return null
    }
  }

  async revokeRequestSessions(request: Request) {
    const ids = new Set<string>()
    let sid: string | undefined
    for (const tokenUse of ['access', 'refresh'] as const) {
      const tokenType = tokenUse === 'access' ? 'accessToken' : 'refreshToken'
      for (const token of [this.extractTokenFromHeader(request, tokenType), this.extractTokenFromCookie(request, tokenType)]) {
        try {
          const payload = this.verifySessionToken(token, tokenUse, true)
          ids.add(payload.sessionId)
          sid ??= payload.sid
        }
        catch (error) {
          if (!(error instanceof UnauthorizedException)) throw error
        }
      }
    }
    for (const id of ids) await this.authSessions.revoke(id)
    return sid
  }

  async createUser(
    uid: string,
    sid: string,
    email: string,
    studentId: string,
    firstName: string,
    lastName: string,
    departmentId: number | undefined,
    status: string | null,
    kaistuid: string | null,
    degree: string | null,
    lastLogin: Date = new Date(),
  ): Promise<session_userprofile> {
    const user = {
      sid,
      uid,
      email,
      first_name: firstName,
      last_name: lastName,
      date_joined: new Date(),
      last_login: lastLogin,
      student_id: studentId,
      // department_id: departmentId,
      status,
      kaist_id: kaistuid,
      refresh_token: null,
      degree,
    }
    return await this.userRepository.createUser(user)
  }

  async updateUser(userId: number, user: Prisma.session_userprofileUpdateInput): Promise<session_userprofile> {
    return await this.userRepository.updateUser(userId, user)
  }

  async tokenRefresh(refreshToken: unknown) {
    const payload = this.verifySessionToken(refreshToken, 'refresh')
    const user = await this.findBySid(payload.sid)
    if (!user) throw new UnauthorizedException('user is not found')
    const session = await this.authSessions.rotate(payload.sessionId, user.id, payload.version, this.tokenLifetime('refresh'))
    if (!session) throw new UnauthorizedException('Refresh session expired or revoked')
    return this.tokensForSession(payload.sid, session)
  }

  public extractTokenFromHeader(request: Request, type: 'accessToken' | 'refreshToken'): string | undefined {
    if (type === 'accessToken') {
      const authHeader = request.headers.authorization
      if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7)
      }
    }
    if (type === 'refreshToken') {
      const refreshHeader = request.headers['x-refresh-token']
      if (typeof refreshHeader === 'string') {
        return refreshHeader
      }
    }
    return undefined
  }

  public extractTokenFromCookie(request: Request, type: 'accessToken' | 'refreshToken'): string | undefined {
    return request.cookies?.[type]
  }

  public extractSidUidFromToken(token: string, opts?: { allowExpired?: boolean }): IAuth.ExtractedIdentity {
    if (!token) throw new UnauthorizedException('Missing token')
    const raw = token.startsWith('Bearer ') ? token.slice(7) : token

    // 1) 정상 검증 (만료 체크)
    try {
      const payload = this.jwtService.verify<any>(raw, {
        ignoreExpiration: !!opts?.allowExpired, // true면 exp 무시
      })
      return {
        sid: typeof payload?.sid === 'string' ? payload.sid : undefined,
        uid: payload?.uid != null ? String(payload.uid) : undefined,
        payload,
      }
    }
    catch {
      // 2) exp 무시 추가 시도 (옵션을 켰는데도 검증 실패할 경우 대비)
      if (opts?.allowExpired) {
        try {
          const payload = this.jwtService.verify<any>(raw, { ignoreExpiration: true })
          return {
            sid: typeof payload?.sid === 'string' ? payload.sid : undefined,
            uid: payload?.uid != null ? String(payload.uid) : undefined,
            payload,
          }
        }
        catch {
          /* fall through */
        }
      }
      // 3) 마지막 폴백: 서명검증 없이 decode (운영에선 비권장, 필요시 주석처리)
      const decoded = this.jwtService.decode(raw) as any
      if (decoded && typeof decoded === 'object') {
        return {
          sid: typeof decoded?.sid === 'string' ? decoded.sid : undefined,
          uid: decoded?.uid != null ? String(decoded.uid) : undefined,
          payload: decoded,
        }
      }
      throw new UnauthorizedException('Invalid token')
    }
  }

  /**
   * 요청에서 토큰을 찾아 sid/uid 추출
   * 우선순위: Authorization 헤더(=access) → accessToken 쿠키 → refreshToken 헤더/쿠키
   */
  public resolveSidUidFromRequest(req: Request, opts?: { allowExpired?: boolean }): IAuth.ExtractedIdentity {
    // 1) Authorization: Bearer xxx
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7)
      return this.extractSidUidFromToken(token, opts)
    }

    // 2) accessToken 쿠키
    const cookieAccess = req.cookies?.accessToken
    if (cookieAccess) {
      return this.extractSidUidFromToken(cookieAccess, opts)
    }

    // 3) refreshToken 헤더/쿠키
    const headerRefresh = (req.headers['X-REFRESH-TOKEN'] || (req.headers['X-REFRESH-TOKEN'] as any)) as
      | string
      | undefined
    if (headerRefresh) {
      return this.extractSidUidFromToken(headerRefresh, opts)
    }
    const cookieRefresh = req.cookies?.refreshToken
    if (cookieRefresh) {
      return this.extractSidUidFromToken(cookieRefresh, opts)
    }

    throw new UnauthorizedException('No token found in request')
  }
}
