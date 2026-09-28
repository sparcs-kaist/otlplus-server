import { Controller, Get, INestApplication, Req, UnauthorizedException, ValidationPipe } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { session_auth_session } from '@prisma/client'
import cookieParser from 'cookie-parser'
import request from 'supertest'

jest.mock('@otl/server-nest/settings', () => ({
  __esModule: true,
  default: () => ({
    getJwtConfig: () => ({ secret: 'rotation-test-secret', signOptions: { expiresIn: 120, refreshExpiresIn: 600 } }),
    getSsoConfig: () => ({ ssoClientId: 'test', ssoSecretKey: 'test', ssoIsBeta: true }),
  }),
}))
jest.mock('@otl/prisma-client/repositories', () => ({ UserRepository: class {} }))
jest.mock('@otl/prisma-client/repositories/notification.repository', () => ({ NotificationPrismaRepository: class {} }))
jest.mock('../sync/syncTakenLecture.service', () => ({ SyncTakenLectureService: class {} }))
jest.mock('../user/user.service', () => ({ UserService: class {} }))
jest.mock('@otl/common/logger/logger', () => ({ __esModule: true, default: { error: jest.fn() } }))

import { HttpExceptionFilter, UnexpectedExceptionFilter } from '@otl/common/exception/exception.filter'
import { AuthSessionRepository, REFRESH_RETRY_SECONDS } from '@otl/prisma-client/repositories/auth-session.repository'

import { UserService } from '../user/user.service'
import { AuthChain } from './auth.chain'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { IsPublicCommand } from './command/isPublic.command'
import { JwtCookieCommand } from './command/jwt.cookie.command'
import { JwtHeaderCommand } from './command/jwt.header.command'
import { AuthGuard } from './guard/auth.guard'
import { JwtCookieStrategy } from './strategy/jwt-cookie.strategy'

@Controller('protected')
class ProtectedController {
  @Get()
  get(@Req() req: any) { return { userId: req.user.id } }
}

describe('session token rotation', () => {
  const jwt = new JwtService({ secret: 'rotation-test-secret' })
  const user = { id: 1, sid: 'user-sid' }
  const rows = new Map<string, session_auth_session>()
  const users = { findBySid: jest.fn(), updateUser: jest.fn() }
  const table = {
    create: jest.fn(async ({ data }) => {
      const row = { ...data, version: 0, revoked_at: null }
      rows.set(row.id, row)
      return { ...row }
    }),
    findUnique: jest.fn(async ({ where }) => rows.get(where.id) ? { ...rows.get(where.id)! } : null),
    update: jest.fn(async ({ where, data }) => {
      const row = rows.get(where.id)!
      const version = data.version ? row.version + data.version.increment : row.version
      const updated = { ...row, ...data, version }
      rows.set(where.id, updated)
      return { ...updated }
    }),
    updateMany: jest.fn(async ({ where, data }) => {
      const row = rows.get(where.id)
      if (!row || row.revoked_at) return { count: 0 }
      rows.set(where.id, { ...row, ...data })
      return { count: 1 }
    }),
  }
  const tx = { session_auth_session: table, $queryRaw: jest.fn() }
  const prisma = { ...tx, $transaction: jest.fn(async (work) => work(tx)) }
  const sessions = new AuthSessionRepository(prisma as any)
  const notifications = {
    findByUserId: jest.fn().mockResolvedValue([]), getAllNotification: jest.fn().mockResolvedValue([]),
  }
  const agreements = { initialize: jest.fn() }
  const service = new AuthService(users as any, jwt, {} as any, notifications as any, agreements as any, sessions)
  let app: INestApplication
  let now: jest.SpyInstance
  const start = Date.UTC(2026, 8, 28, 0, 0, 0)
  const advance = (seconds: number) => now.mockReturnValue(start + seconds * 1000)

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController, ProtectedController],
      providers: [
        { provide: AuthService, useValue: service },
        { provide: UserService, useValue: {} },
      ],
    }).compile()
    app = module.createNestApplication()
    app.use(cookieParser())
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
    app.useGlobalFilters(new UnexpectedExceptionFilter(), new HttpExceptionFilter())
    const reflector = new Reflector()
    app.useGlobalGuards(new AuthGuard(new AuthChain()
      .register(new JwtHeaderCommand(reflector, service))
      .register(new JwtCookieCommand(reflector, service))
      .register(new IsPublicCommand(reflector))))
    await app.init()
  })
  beforeEach(() => {
    jest.clearAllMocks()
    rows.clear()
    users.findBySid.mockImplementation(async (sid) => sid === user.sid ? user : null)
    now = jest.spyOn(Date, 'now').mockReturnValue(start)
  })
  afterEach(() => now.mockRestore())
  afterAll(async () => { await app.close() })

  it('creates independent sessions even for simultaneous logins by the same user', async () => {
    const a = await service.createSession(user)
    const b = await service.createSession(user)
    expect(jwt.verify(a.refreshToken).sessionId).not.toBe(jwt.verify(b.refreshToken).sessionId)
    expect(rows.size).toBe(2)
    expect(service.verifyAccessToken(a.accessToken).tokenUse).toBe('access')
    expect(() => service.verifyAccessToken(a.refreshToken)).toThrow(UnauthorizedException)
    await expect(service.tokenRefresh(a.accessToken)).rejects.toThrow(UnauthorizedException)
    await expect(new JwtCookieStrategy(service).validate(jwt.verify(a.refreshToken))).rejects.toThrow(UnauthorizedException)
  })

  it('SSO login persists each session before returning tokens and no longer stores a user-wide refresh hash', async () => {
    const existing = { ...user, student_id: '12345678' }
    users.findBySid.mockResolvedValue(existing)
    users.updateUser.mockResolvedValue(existing)
    const profile = {
      sid: user.sid, uid: 'uid', kaist_id: 'kaist', email: 'test@example.invalid',
      first_name: 'Test', last_name: 'User', kaist_v2_info: { std_no: '12345678' },
    }
    const a = await service.ssoLogin(profile as any)
    const b = await service.ssoLogin(profile as any)
    expect(rows.has(jwt.verify(a.refreshToken).sessionId)).toBe(true)
    expect(jwt.verify(a.refreshToken).sessionId).not.toBe(jwt.verify(b.refreshToken).sessionId)
    expect(users.updateUser).toHaveBeenCalledWith(1, expect.objectContaining({ refresh_token: null }))
  })

  it('rotates both tokens and returns the same pair for retries without extending the window', async () => {
    const first = await service.createSession(user)
    advance(121)
    const next = await service.tokenRefresh(first.refreshToken)
    expect(next.refreshToken).not.toBe(first.refreshToken)
    expect(next.accessToken).not.toBe(first.accessToken)
    expect(jwt.verify(next.refreshToken)).toMatchObject({ version: 1, iat: start / 1000 + 121, exp: start / 1000 + 721 })
    advance(121 + REFRESH_RETRY_SECONDS - 1)
    for (const token of [first.refreshToken, next.refreshToken]) {
      const retry = await service.tokenRefresh(token)
      expect(retry.refreshToken).toBe(next.refreshToken)
      expect(retry.accessToken).toBe(next.accessToken)
    }
    expect(table.update).toHaveBeenCalledTimes(1)
    advance(121 + REFRESH_RETRY_SECONDS)
    await expect(service.tokenRefresh(first.refreshToken)).rejects.toThrow(UnauthorizedException)
    await expect(service.tokenRefresh(next.refreshToken)).rejects.toThrow(UnauthorizedException)
    expect([...rows.values()][0].revoked_at).not.toBeNull()
  })

  it('allows the current token to rotate again after the retry window', async () => {
    const first = await service.createSession(user)
    const next = await service.tokenRefresh(first.refreshToken)
    advance(REFRESH_RETRY_SECONDS)
    const third = await service.tokenRefresh(next.refreshToken)
    expect(jwt.verify(third.refreshToken).version).toBe(2)
    await expect(service.tokenRefresh(first.refreshToken)).rejects.toThrow(UnauthorizedException)
    await expect(service.tokenRefresh(third.refreshToken)).rejects.toThrow(UnauthorizedException)
  })

  it('keeps another device logged in after replay or logout of one session', async () => {
    const a = await service.createSession(user)
    const b = await service.createSession(user)
    await service.tokenRefresh(a.refreshToken)
    advance(REFRESH_RETRY_SECONDS + 1)
    await expect(service.tokenRefresh(a.refreshToken)).rejects.toThrow(UnauthorizedException)
    await expect(service.tokenRefresh(b.refreshToken)).resolves.toHaveProperty('accessToken')
  })

  it.each(['malformed', 'expired', 'legacy', 'wrong signature', 'wrong owner', 'missing exp', 'wrong algorithm'])
  ('rejects %s tokens with 401 and no cookies', async (kind) => {
    const pair = await service.createSession(user)
    const payload = jwt.verify(pair.refreshToken)
    const { exp: _exp, ...withoutExpiry } = payload
    const token = {
      malformed: 'not-a-jwt',
      expired: jwt.sign({ ...payload, exp: start / 1000 - 1 }),
      legacy: jwt.sign({ sid: user.sid, exp: start / 1000 + 600 }),
      'wrong signature': jwt.sign(payload, { secret: 'another-secret' }),
      'wrong owner': jwt.sign({ ...payload, sid: 'unknown-user' }),
      'missing exp': jwt.sign(withoutExpiry),
      'wrong algorithm': jwt.sign(payload, { algorithm: 'HS384' }),
    }[kind]!
    const response = await request(app.getHttpServer()).post('/session/refresh').send({ token })
    expect(response.status).toBe(401)
    expect(response.headers['set-cookie']).toBeUndefined()
    expect(table.update).not.toHaveBeenCalled()
  })

  it('returns 200 and both tokens/cookies from the explicit endpoint without double rotation', async () => {
    const pair = await service.createSession(user)
    advance(121)
    const response = await request(app.getHttpServer()).post('/session/refresh')
      .set('Cookie', [`accessToken=${pair.accessToken}`, `refreshToken=${pair.refreshToken}`])
      .send({ token: pair.refreshToken })
    expect(response.status).toBe(200)
    expect(response.headers['set-cookie']).toHaveLength(2)
    expect(jwt.verify(response.body.refreshToken).version).toBe(1)
    expect(service.verifyAccessToken(response.body.accessToken).sid).toBe(user.sid)
    expect(table.update).toHaveBeenCalledTimes(1)
  })

  it.each(['cookie', 'header'])('uses the same rotation/replay checks for %s authentication', async (source) => {
    const pair = await service.createSession(user)
    advance(121)
    const call = () => {
      const req = request(app.getHttpServer()).get('/protected')
      return source === 'cookie'
        ? req.set('Cookie', [`accessToken=${pair.accessToken}`, `refreshToken=${pair.refreshToken}`])
        : req.set('Authorization', `Bearer ${pair.accessToken}`).set('X-REFRESH-TOKEN', pair.refreshToken)
    }
    const response = await call()
    expect(response.status).toBe(200)
    expect(response.body.userId).toBe(1)
    expect(response.headers['set-cookie']).toHaveLength(2)
    advance(121 + REFRESH_RETRY_SECONDS)
    expect((await call()).status).toBe(401)
  })

  it('does not accept a refresh token or a legacy token as a bearer access token', async () => {
    const pair = await service.createSession(user)
    for (const token of [pair.refreshToken, jwt.sign({ sid: user.sid })]) {
      const response = await request(app.getHttpServer()).get('/protected').set('Authorization', `Bearer ${token}`)
      expect(response.status).toBe(401)
    }
  })

  it('revokes the session and clears cookies at logout even when access has expired', async () => {
    const pair = await service.createSession(user)
    advance(121)
    const response = await request(app.getHttpServer()).get('/session/logout')
      .set('Cookie', [`accessToken=${pair.accessToken}`, `refreshToken=${pair.refreshToken}`])
    expect(response.status).toBe(302)
    expect(response.headers.location).toContain('sid=user-sid')
    expect(response.headers['set-cookie']).toHaveLength(3)
    expect(table.update).not.toHaveBeenCalled()
    expect(table.updateMany).toHaveBeenCalledTimes(1)
    await expect(service.tokenRefresh(pair.refreshToken)).rejects.toThrow(UnauthorizedException)
  })

  it.each(['refresh', 'cookie', 'header'])('keeps database outages as 500 on %s paths', async (path) => {
    const pair = await service.createSession(user)
    advance(121)
    users.findBySid.mockRejectedValueOnce(new Error('database unavailable'))
    let req = path === 'refresh'
      ? request(app.getHttpServer()).post('/session/refresh').send({ token: pair.refreshToken })
      : request(app.getHttpServer()).get('/protected')
    if (path === 'cookie') req = req.set('Cookie', [`refreshToken=${pair.refreshToken}`])
    if (path === 'header') req = req.set('X-REFRESH-TOKEN', pair.refreshToken)
    expect((await req).status).toBe(500)
    expect(table.update).not.toHaveBeenCalled()
  })

  it('preserves a database write failure as 500 without issuing cookies', async () => {
    const pair = await service.createSession(user)
    const failure = jest.spyOn(sessions, 'rotate').mockRejectedValueOnce(new Error('transaction failed'))
    try {
      const response = await request(app.getHttpServer()).post('/session/refresh').send({ token: pair.refreshToken })
      expect(response.status).toBe(500)
      expect(response.headers['set-cookie']).toBeUndefined()
    }
    finally { failure.mockRestore() }
  })

  it.each([{}, { token: {} }, { token: '' }])('validates request bodies: %j', async (body) => {
    expect((await request(app.getHttpServer()).post('/session/refresh').send(body)).status).toBe(400)
  })
})
