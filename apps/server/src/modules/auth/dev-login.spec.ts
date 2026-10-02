import { BadRequestException, ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { IAuth } from '@otl/server-nest/common/interfaces'
import settings from '@otl/server-nest/settings'
import { ESSOUser } from '@otl/prisma-client/entities'
import { createHmac } from 'node:crypto'
import cookieParser from 'cookie-parser'
import supertest from 'supertest'

import { UserService } from '../user/user.service'
import { AuthChain } from './auth.chain'
import { AuthConfig } from './auth.config'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtCookieCommand } from './command/jwt.cookie.command'
import { JwtHeaderCommand } from './command/jwt.header.command'
import { IsPublicCommand } from './command/isPublic.command'
import { AuthGuard } from './guard/auth.guard'
import { Client } from './utils/sparcs-sso'

const jwt = new JwtService()
const originalEnv = { ...process.env }
const profile = { uid: 'tester-uid', sid: 'dev-sso-sid' } as ESSOUser.SSOUser
const user = { id: 42, sid: 'copied-prod-sid', student_id: '20201234' }
let repository: {
  findByStudentId: jest.Mock
  findBySid: jest.Mock
  updateUser: jest.Mock
  createUser: jest.Mock
}
let service: AuthService
let controller: AuthController
let response: IAuth.Response
const request = (cookies = {}, origin = 'https://otl.dev.sparcs.org') =>
  ({
    cookies,
    headers: {},
    get: () => origin,
  }) as unknown as IAuth.Request
const proof = () => service.createDevSsoToken(profile)

beforeEach(() => {
  Object.assign(process.env, {
    NODE_ENV: 'dev',
    JWT_SECRET: 'test-root-secret',
    EXPIRES_IN: '600',
    REFRESH_EXPIRES_IN: '3600',
    SSO_CLIENT_ID: 'test-client',
    SSO_SECRET_KEY: 'test-sso-secret',
    WEB_URL: 'https://otl.dev.sparcs.org',
  })
  repository = {
    findByStudentId: jest.fn().mockResolvedValue(user),
    findBySid: jest.fn().mockImplementation(async (sid) => (sid === user.sid ? user : null)),
    updateUser: jest.fn(),
    createUser: jest.fn(),
  }
  service = new AuthService(repository as never, jwt, {} as never, {} as never, {} as never)
  controller = new AuthController(service, {} as UserService)
  response = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
    setHeader: jest.fn(),
    redirect: jest.fn(),
  } as unknown as IAuth.Response
})

afterEach(() => {
  process.env = { ...originalEnv }
  jest.restoreAllMocks()
  jest.useRealTimers()
})

it('exchanges SSO proof for the copied user tokens without changing the DB, and refreshes them', async () => {
  const tokens = await controller.devLogin(user.student_id, request({ devSsoToken: proof() }), response)
  const secret = settings().getJwtConfig().secret
  const refreshed = await service.tokenRefresh(tokens.refreshToken)
  for (const token of [tokens.accessToken, tokens.refreshToken, refreshed.accessToken, refreshed.refreshToken]) {
    expect(jwt.verify(token, { secret })).toEqual({ sid: user.sid, iat: expect.any(Number), exp: expect.any(Number) })
  }
  expect(repository.findBySid).toHaveBeenCalledWith(user.sid)
  expect(repository.updateUser).not.toHaveBeenCalled()
  expect(repository.createUser).not.toHaveBeenCalled()
  expect(response.cookie).toHaveBeenCalledWith(
    'accessToken',
    tokens.accessToken,
    expect.objectContaining({ httpOnly: true, secure: true }),
  )
  expect(response.clearCookie).toHaveBeenCalledWith('devSsoToken', expect.objectContaining({ path: '/session/dev' }))
})

it('separates proof, dev session and production keys even with the same JWT_SECRET', async () => {
  const token = proof()
  const { accessToken, refreshToken } = await service.devLogin(token, user.student_id)
  expect(() => jwt.verify(token, { secret: settings().getJwtConfig().secret })).toThrow()
  await expect(service.devLogin(accessToken, user.student_id)).rejects.toBeInstanceOf(UnauthorizedException)
  await expect(service.tokenRefresh(token)).rejects.toBeInstanceOf(UnauthorizedException)
  process.env.NODE_ENV = 'prod'
  for (const sessionToken of [accessToken, refreshToken]) {
    expect(() => jwt.verify(sessionToken, { secret: settings().getJwtConfig().secret })).toThrow()
  }
})

it('rejects missing, forged, expired and wrong-purpose proof before looking up a student', async () => {
  const expired = proof()
  jest.useFakeTimers().setSystemTime(Date.now() + 601_000)
  const secret = createHmac('sha256', settings().getJwtConfig().secret!).update('otl-dev-sso').digest('hex')
  const wrongPurpose = jwt.sign({ sub: profile.uid }, { secret, audience: 'other', expiresIn: '10m' })
  for (const token of [
    undefined,
    'invalid',
    jwt.sign({ sub: profile.uid }, { secret: 'wrong' }),
    expired,
    wrongPurpose,
  ]) {
    await expect(service.devLogin(token, user.student_id)).rejects.toBeInstanceOf(UnauthorizedException)
  }
  expect(repository.findByStudentId).not.toHaveBeenCalled()
})

it('rejects invalid student IDs and handles missing users without issuing tokens', async () => {
  const token = proof()
  for (const studentId of [undefined, 20201234, '', '0', '2020abc', '1e8', '9007199254740993', {}]) {
    await expect(service.devLogin(token, studentId)).rejects.toBeInstanceOf(BadRequestException)
  }
  expect(repository.findByStudentId).not.toHaveBeenCalled()
  repository.findByStudentId.mockResolvedValueOnce(null)
  await expect(service.devLogin(token, user.student_id)).rejects.toBeInstanceOf(NotFoundException)
})

it('exposes the exchange only in dev and checks the requesting origin', async () => {
  const token = proof()
  for (const origin of ['', 'https://example.com']) {
    await expect(
      controller.devLogin(user.student_id, request({ devSsoToken: token }, origin), response),
    ).rejects.toBeInstanceOf(ForbiddenException)
  }
  for (const env of ['prod', 'local', 'production', 'test', '']) {
    process.env.NODE_ENV = env
    await expect(
      controller.devLogin(user.student_id, request({ devSsoToken: token }), response),
    ).rejects.toBeInstanceOf(NotFoundException)
    await expect(service.devLogin(token, user.student_id)).rejects.toBeInstanceOf(NotFoundException)
    expect(() => service.createDevSsoToken(profile)).toThrow(NotFoundException)
  }
})

it('checks SSO state before exchanging a code, then issues only a short-lived proof cookie', async () => {
  const getProfile = jest.spyOn(Client.prototype, 'get_user_info').mockResolvedValue(profile)
  const ssoLogin = jest.spyOn(service, 'ssoLogin')
  for (const state of ['', 'wrong']) {
    await expect(
      controller.loginCallback(state, 'code', '', request({ sso_state: 'state' }), {}, response),
    ).rejects.toBeInstanceOf(UnauthorizedException)
  }
  expect(getProfile).not.toHaveBeenCalled()
  await controller.loginCallback('state', 'code', 'https://evil.test', request({ sso_state: 'state' }), {}, response)
  expect(response.cookie).toHaveBeenCalledTimes(1)
  expect(response.cookie).toHaveBeenCalledWith(
    'devSsoToken',
    expect.any(String),
    expect.objectContaining({
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/session/dev',
      maxAge: 600_000,
    }),
  )
  expect(response.redirect).toHaveBeenCalledWith('https://otl.dev.sparcs.org/login/success#devLogin=1')
  expect(ssoLogin).not.toHaveBeenCalled()
  expect(repository.findByStudentId).not.toHaveBeenCalled()
})

it('does not issue proof when SSO fails', async () => {
  jest.spyOn(Client.prototype, 'get_user_info').mockRejectedValue(new Error('SSO failed'))
  await expect(
    controller.loginCallback('state', 'code', '', request({ sso_state: 'state' }), {}, response),
  ).rejects.toThrow('SSO failed')
  expect(response.cookie).not.toHaveBeenCalled()
})

it('starts a fresh SSO flow with a callback-compatible state cookie even when a user is logged in', () => {
  jest.spyOn(Client.prototype, 'get_login_params').mockReturnValue({ url: 'https://sso.test', state: 'state' })
  controller.user_login('/', '', { ...request(), user } as unknown as IAuth.Request, response)
  expect(response.cookie).toHaveBeenCalledWith('sso_state', 'state', expect.objectContaining({ sameSite: 'lax' }))
  expect(response.redirect).toHaveBeenCalledWith('https://sso.test')
})

it('logs out locally instead of passing a copied production SID to dev SSO', async () => {
  const logout = jest.spyOn(Client.prototype, 'get_logout_url')
  await controller.logout(request(), response, '', user as never)
  expect(logout).not.toHaveBeenCalled()
  expect(response.clearCookie).toHaveBeenCalledWith('refreshToken', expect.any(Object))
  expect(response.redirect).toHaveBeenCalledWith('https://otl.dev.sparcs.org/')
})

it('uses signed JWT authentication in dev, keeps local student login, and rejects raw SID/OneApp bypasses', async () => {
  const chain = new AuthChain()
  const reflector = new Reflector()
  const cookieCommand = new JwtCookieCommand(reflector, service, jwt)
  const headerCommand = new JwtHeaderCommand(reflector, service, jwt)
  const pass = { next: jest.fn(async (_context, result) => result) }
  const bypass = {
    next: jest.fn(async (_context, result) => ({ ...result, authentication: true, authorization: true })),
  }
  const config = new AuthConfig(
    chain,
    cookieCommand,
    bypass as never,
    headerCommand,
    bypass as never,
    bypass as never,
    bypass as never,
    pass as never,
    pass as never,
    pass as never,
    pass as never,
    pass as never,
    pass as never,
  )
  await config.config('dev')
  const req = request()
  const context = { switchToHttp: () => ({ getRequest: () => req, getResponse: () => response }) } as never
  await expect(chain.execute(context)).rejects.toBeInstanceOf(UnauthorizedException)
  expect(bypass.next).not.toHaveBeenCalled()
  const { accessToken, refreshToken } = await service.devLogin(proof(), user.student_id)
  req.cookies = { accessToken, refreshToken }
  await expect(chain.execute(context)).resolves.toBe(true)
  expect(req.user).toEqual(user)
  req.cookies = { refreshToken }
  await expect(chain.execute(context)).resolves.toBe(true)
  req.cookies = {}
  req.headers.authorization = `Bearer ${accessToken}`
  await expect(chain.execute(context)).resolves.toBe(true)
  req.headers = {}
  process.env.NODE_ENV = 'local'
  await config.config('local')
  await expect(chain.execute(context)).resolves.toBe(true)
  expect(bypass.next).toHaveBeenCalled()
})

it('preserves the production SSO callback', async () => {
  process.env.NODE_ENV = 'prod'
  jest.spyOn(Client.prototype, 'get_user_info').mockResolvedValue(profile)
  const tokens = {
    accessToken: 'production-access',
    refreshToken: 'production-refresh',
    accessTokenOptions: {},
    refreshTokenOptions: {},
  }
  jest.spyOn(service, 'ssoLogin').mockResolvedValue(tokens as never)
  jest.spyOn(service, 'findByUid').mockResolvedValue(null)
  jest.spyOn(service, 'findBySid').mockResolvedValue(null)
  await controller.loginCallback('state', 'code', 'https://otl.kaist.ac.kr', request(), {}, response)
  expect(service.ssoLogin).toHaveBeenCalledWith(profile)
  expect(response.cookie).toHaveBeenCalledTimes(2)
  expect(response.redirect).toHaveBeenCalledWith(
    'https://otl.kaist.ac.kr/login/success#accessToken=production-access&refreshToken=production-refresh',
  )
})

it('runs login, callback, account selection and authenticated profile through the HTTP routes', async () => {
  jest.spyOn(Client.prototype, 'get_login_params').mockReturnValue({ url: 'https://sso.test', state: 'state' })
  jest.spyOn(Client.prototype, 'get_user_info').mockResolvedValue(profile)
  const getProfile = jest.fn(async (selectedUser) => ({ id: selectedUser.id }))
  const module = await Test.createTestingModule({
    controllers: [AuthController],
    providers: [
      { provide: AuthService, useValue: service },
      { provide: UserService, useValue: { getProfile } },
    ],
  }).compile()
  const app = module.createNestApplication()
  app.use(cookieParser())
  app.enableCors(settings().getCorsConfig())
  const reflector = new Reflector()
  app.useGlobalGuards(
    new AuthGuard(
      new AuthChain().register(new IsPublicCommand(reflector)).register(new JwtCookieCommand(reflector, service, jwt)),
    ),
  )
  await app.init()
  try {
    const http = supertest(app.getHttpServer())
    const cookies = (res: supertest.Response) =>
      (res.headers['set-cookie'] as unknown as string[]).map((cookie) => cookie.split(';')[0])
    const login = await http.get('/session/login').expect(302)
    const callback = await http
      .get('/session/login/callback?state=state&code=code')
      .set('Cookie', cookies(login))
      .expect(302)
    expect(callback.headers.location).toBe('https://otl.dev.sparcs.org/login/success#devLogin=1')
    await http
      .post('/session/dev/login')
      .set('Origin', process.env.WEB_URL!)
      .send({ studentId: user.student_id })
      .expect(401)
    const selected = await http
      .post('/session/dev/login')
      .set('Origin', process.env.WEB_URL!)
      .set('Cookie', cookies(callback))
      .send({ studentId: user.student_id })
      .expect(201)
    expect(selected.headers['access-control-allow-origin']).toBe(process.env.WEB_URL)
    expect(selected.headers['access-control-allow-credentials']).toBe('true')
    await http.get('/session/info').set('Cookie', cookies(selected)).expect(200, { id: user.id })
    process.env.NODE_ENV = 'prod'
    await http
      .post('/session/dev/login')
      .set('Origin', 'https://otl.dev.sparcs.org')
      .set('Cookie', cookies(callback))
      .send({ studentId: user.student_id })
      .expect(404)
  } finally {
    await app.close()
  }
})

it('rejects a selected account without a SID instead of issuing unusable tokens', async () => {
  const token = proof()
  const sign = jest.spyOn(jwt, 'sign')
  repository.findByStudentId.mockResolvedValue({ ...user, sid: '' })
  await expect(service.devLogin(token, user.student_id)).rejects.toBeInstanceOf(BadRequestException)
  expect(sign).not.toHaveBeenCalled()
})
