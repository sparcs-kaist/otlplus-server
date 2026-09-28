import { Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'

import { PrismaService } from '../prisma.service'

// A fixed window permits concurrent requests and retries after a lost response.
// Replaying a token never extends this window or issues another generation.
export const REFRESH_RETRY_SECONDS = 60

@Injectable()
export class AuthSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: number, lifetimeSeconds: number) {
    const issuedAt = new Date(Math.floor(Date.now() / 1000) * 1000)
    return this.prisma.session_auth_session.create({
      data: {
        id: randomUUID(),
        userprofile_id: userId,
        issued_at: issuedAt,
        expires_at: new Date(issuedAt.getTime() + lifetimeSeconds * 1000),
      },
    })
  }

  rotate(id: string, userId: number, version: number, lifetimeSeconds: number) {
    return this.prisma.$transaction(async (tx) => {
      // Lock only this login session; separate devices can refresh independently.
      await tx.$queryRaw`SELECT id FROM session_auth_session WHERE id = ${id} FOR UPDATE`
      const session = await tx.session_auth_session.findUnique({ where: { id } })
      const now = new Date(Math.floor(Date.now() / 1000) * 1000)
      if (!session || session.userprofile_id !== userId || session.revoked_at || session.expires_at <= now) {
        return null
      }

      const retryWindow = session.version > 0
        && now.getTime() < session.issued_at.getTime() + REFRESH_RETRY_SECONDS * 1000
      if (retryWindow && (version === session.version || version === session.version - 1)) {
        return session
      }
      if (version !== session.version) {
        // Return (do not throw) so revocation commits before the caller sends 401.
        await tx.session_auth_session.update({ where: { id }, data: { revoked_at: now } })
        return null
      }

      return tx.session_auth_session.update({
        where: { id },
        data: {
          version: { increment: 1 },
          issued_at: now,
          expires_at: new Date(now.getTime() + lifetimeSeconds * 1000),
        },
      })
    })
  }

  revoke(id: string) {
    return this.prisma.session_auth_session.updateMany({
      where: { id, revoked_at: null },
      data: { revoked_at: new Date() },
    })
  }
}
