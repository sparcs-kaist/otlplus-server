import { randomUUID } from 'crypto'

import { PrismaService } from '../prisma.service'
import { AuthSessionRepository, REFRESH_RETRY_SECONDS } from './auth-session.repository'

// Opt in with a disposable local database whose schema includes the migration.
// See apps/server/docs/refresh-token-rotation.md for the exact commands.
const databaseUrl = process.env.AUTH_SESSION_TEST_DATABASE_URL
const describeDatabase = databaseUrl ? describe : describe.skip

describeDatabase('AuthSessionRepository with MySQL row locks', () => {
  let prisma: PrismaService
  let sessions: AuthSessionRepository
  let userId: number

  beforeAll(async () => {
    const url = new URL(databaseUrl!)
    if (!['localhost', '127.0.0.1'].includes(url.hostname) || !url.pathname.endsWith('_test')) {
      throw new Error('Use a disposable local database ending in _test')
    }
    prisma = new PrismaService({
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.slice(1),
      connectionLimit: 10,
    })
    sessions = new AuthSessionRepository(prisma)
    const user = await prisma.session_userprofile.create({
      data: {
        sid: `rotation-${randomUUID().slice(0, 8)}`,
        student_id: '0000000000', language: 'ko', first_name: 'Rotation', last_name: 'Test',
        date_joined: new Date(), last_login: new Date(),
      },
    })
    userId = user.id
  })

  afterAll(async () => {
    if (userId) await prisma.session_userprofile.delete({ where: { id: userId } })
    await prisma?.$disconnect()
  })

  it('concurrent refreshes commit one generation and return the same replacement', async () => {
    const session = await sessions.create(userId, 600)
    const results = await Promise.all(Array.from({ length: 8 }, () => sessions.rotate(session.id, userId, 0, 600)))
    expect(results).toHaveLength(8)
    for (const result of results) expect(result).toEqual(results[0])
    expect(results[0]?.version).toBe(1)
    const retried = await sessions.rotate(session.id, userId, 1, 600)
    expect(retried).toEqual(results[0])
    const stored = await prisma.session_auth_session.findUniqueOrThrow({ where: { id: session.id } })
    expect(stored.version).toBe(1)
  })

  it('commits replay revocation outside the window while preserving another login', async () => {
    const a = await sessions.create(userId, 600)
    const b = await sessions.create(userId, 600)
    await sessions.rotate(a.id, userId, 0, 600)
    await prisma.session_auth_session.update({
      where: { id: a.id },
      data: { issued_at: new Date(Date.now() - (REFRESH_RETRY_SECONDS + 1) * 1000) },
    })
    expect(await sessions.rotate(a.id, userId, 0, 600)).toBeNull()
    expect(await sessions.rotate(a.id, userId, 1, 600)).toBeNull()
    expect((await prisma.session_auth_session.findUniqueOrThrow({ where: { id: a.id } })).revoked_at).not.toBeNull()
    expect((await sessions.rotate(b.id, userId, 0, 600))?.version).toBe(1)
  })

  it('rotates the current generation again after the window and rejects older generations', async () => {
    const session = await sessions.create(userId, 600)
    await sessions.rotate(session.id, userId, 0, 600)
    await prisma.session_auth_session.update({
      where: { id: session.id },
      data: { issued_at: new Date(Date.now() - (REFRESH_RETRY_SECONDS + 1) * 1000) },
    })
    expect((await sessions.rotate(session.id, userId, 1, 600))?.version).toBe(2)
    expect(await sessions.rotate(session.id, userId, 0, 600)).toBeNull()
    expect(await sessions.rotate(session.id, userId, 2, 600)).toBeNull()
  })

  it('does not modify missing, foreign, expired or revoked sessions', async () => {
    const session = await sessions.create(userId, 600)
    expect(await sessions.rotate(randomUUID(), userId, 0, 600)).toBeNull()
    expect(await sessions.rotate(session.id, userId + 1, 0, 600)).toBeNull()
    expect((await prisma.session_auth_session.findUniqueOrThrow({ where: { id: session.id } })).revoked_at).toBeNull()
    await prisma.session_auth_session.update({ where: { id: session.id }, data: { expires_at: new Date(0) } })
    expect(await sessions.rotate(session.id, userId, 0, 600)).toBeNull()
    const active = await sessions.create(userId, 600)
    await sessions.revoke(active.id)
    expect(await sessions.rotate(active.id, userId, 0, 600)).toBeNull()
  })

  it('a concurrent logout cannot be undone by rotation', async () => {
    const session = await sessions.create(userId, 600)
    await Promise.all([sessions.rotate(session.id, userId, 0, 600), sessions.revoke(session.id)])
    expect((await prisma.session_auth_session.findUniqueOrThrow({ where: { id: session.id } })).revoked_at).not.toBeNull()
    expect(await sessions.rotate(session.id, userId, 1, 600)).toBeNull()
  })
})
