import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { getRedisConnectionToken } from '@nestjs-modules/ioredis'
import { NextFunction, Request, Response } from 'express'
import request from 'supertest'

import { FriendCodeRateLimitGuard } from './friend-code-rate-limit.guard'
import { FriendsController } from './friends.controller'
import { FriendsService } from './friends.service'

describe('FriendCodeRateLimitGuard with FriendsController', () => {
  const redis = { eval: jest.fn(), disconnect: jest.fn() }
  const service = { getCode: jest.fn(), addFriend: jest.fn() }
  let app: INestApplication

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [FriendsController],
      providers: [
        FriendCodeRateLimitGuard,
        { provide: getRedisConnectionToken('friends'), useValue: redis },
        { provide: FriendsService, useValue: service },
      ],
    }).compile()
    app = module.createNestApplication()
    // Stand in for the global authentication guard, not for the route's real rate-limit guard.
    app.use((req: Request & { user?: { id: number } }, _res: Response, next: NextFunction) => {
      if (req.headers['x-test-user']) req.user = { id: Number(req.headers['x-test-user']) }
      next()
    })
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
    await app.init()
  })

  beforeEach(() => {
    jest.resetAllMocks()
    redis.eval.mockResolvedValue(0)
    service.getCode.mockResolvedValue({ code: 'K7L4MX' })
    service.addFriend.mockResolvedValue({ friend: { id: 100, name: 'Test Friend', isFavorite: false } })
  })

  afterAll(async () => {
    await app.close()
  })

  it('normalizes the code and uses the authenticated identity, not senderId from the body', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v2/friends')
      .set('x-test-user', '42')
      .send({ code: '  k7l4mx\n', senderId: 999, userId: 999 })
      .expect(201)
    expect(response.body).toEqual({ friend: { id: 100, name: 'Test Friend', isFavorite: false } })
    expect(response.headers['cache-control']).toBe('private, no-store')
    expect(service.addFriend).toHaveBeenCalledWith({ id: 42 }, 'K7L4MX')
    expect(redis.eval).toHaveBeenCalledWith(
      expect.any(String),
      2,
      'friends:add:{42}:minute',
      'friends:add:{42}:day',
      10,
      60,
      100,
      86400,
    )
  })

  it('has separate counters for different authenticated accounts without including the invite code', async () => {
    for (const userId of ['42', '43']) {
      await request(app.getHttpServer())
        .post('/api/v2/friends')
        .set('x-test-user', userId)
        .send({ code: 'K7L4MX' })
        .expect(201)
    }
    expect(redis.eval.mock.calls[0].slice(2, 4)).toEqual(['friends:add:{42}:minute', 'friends:add:{42}:day'])
    expect(redis.eval.mock.calls[1].slice(2, 4)).toEqual(['friends:add:{43}:minute', 'friends:add:{43}:day'])
    expect(JSON.stringify(redis.eval.mock.calls)).not.toContain('K7L4MX')
  })

  it('rejects requests without an authenticated user before touching Redis or the service', async () => {
    await request(app.getHttpServer()).post('/api/v2/friends').send({ code: 'K7L4MX', senderId: 42 }).expect(401)
    expect(redis.eval).not.toHaveBeenCalled()
    expect(service.addFriend).not.toHaveBeenCalled()
  })

  it.each([60, 86400])('returns 429 and Retry-After when a counter requires %i seconds', async (retryAfter) => {
    redis.eval.mockResolvedValue(retryAfter)
    const response = await request(app.getHttpServer())
      .post('/api/v2/friends')
      .set('x-test-user', '42')
      .send({ code: 'K7L4MX' })
      .expect(429)
    expect(response.headers['retry-after']).toBe(String(retryAfter))
    expect(service.addFriend).not.toHaveBeenCalled()
  })

  it('fails closed with 503 if Redis is unavailable', async () => {
    redis.eval.mockRejectedValue(new Error('Redis unavailable'))
    await request(app.getHttpServer())
      .post('/api/v2/friends')
      .set('x-test-user', '42')
      .send({ code: 'K7L4MX' })
      .expect(503)
    expect(service.addFriend).not.toHaveBeenCalled()
  })

  it('fails closed with 503 if Redis returns an invalid result', async () => {
    redis.eval.mockResolvedValue('invalid')
    await request(app.getHttpServer())
      .post('/api/v2/friends')
      .set('x-test-user', '42')
      .send({ code: 'K7L4MX' })
      .expect(503)
    expect(service.addFriend).not.toHaveBeenCalled()
  })

  it('counts malformed attempts before DTO validation and never calls the service', async () => {
    await request(app.getHttpServer())
      .post('/api/v2/friends')
      .set('x-test-user', '42')
      .send({ code: 'IO01S5' })
      .expect(400)
    expect(redis.eval).toHaveBeenCalledTimes(1)
    expect(service.addFriend).not.toHaveBeenCalled()
  })

  it('returns the own code without caching or consuming friend-add attempts', async () => {
    const response = await request(app.getHttpServer()).get('/api/v2/friends/code').set('x-test-user', '42').expect(200)
    expect(response.body).toEqual({ code: 'K7L4MX' })
    expect(response.headers['cache-control']).toBe('private, no-store')
    expect(service.getCode).toHaveBeenCalledWith({ id: 42 })
    expect(redis.eval).not.toHaveBeenCalled()
  })

  it.each(['/api/v2/friends/invites', '/api/v2/friends/invites/accept'])(
    'removes the old POST %s endpoint',
    async (url) => {
      await request(app.getHttpServer()).post(url).set('x-test-user', '42').send({ token: 'old-token' }).expect(404)
      expect(service.addFriend).not.toHaveBeenCalled()
      expect(redis.eval).not.toHaveBeenCalled()
    },
  )
})
