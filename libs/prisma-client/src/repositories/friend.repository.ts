import { Injectable } from '@nestjs/common'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { randomInt } from 'crypto'

import { EFriend } from '@otl/prisma-client/entities/EFriend'

export const FRIEND_CODE_ALPHABET = 'ACDEFHJKLMNPQRTUVWXY3479'

@Injectable()
export class FriendRepository {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterPrisma>) {}

  async getOrCreateCode(userId: number): Promise<string> {
    const codes = this.txHost.tx.session_userprofile_friend_codes
    const existing = await codes.findUnique({ where: { userprofile_id: userId } })
    if (existing) return existing.code

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const code = Array.from({ length: 6 }, () => FRIEND_CODE_ALPHABET[randomInt(FRIEND_CODE_ALPHABET.length)]).join('')
      // A no-op upsert handles both unique keys without overwriting an existing code.
      await this.txHost.tx.$executeRaw`
        INSERT INTO session_userprofile_friend_codes (userprofile_id, code)
        VALUES (${userId}, ${code})
        ON DUPLICATE KEY UPDATE userprofile_id = userprofile_id
      `
      const winner = await codes.findUnique({ where: { userprofile_id: userId } })
      if (winner) return winner.code
    }
    throw new Error('Could not allocate a unique friend code')
  }

  async getUserIdByCode(code: string): Promise<number | null> {
    const owner = await this.txHost.tx.session_userprofile_friend_codes.findUnique({
      where: { code },
      select: { userprofile_id: true },
    })
    return owner?.userprofile_id ?? null
  }

  async getFriends(userId: number): Promise<EFriend.Summary[]> {
    return this.txHost.tx.session_userprofile_friends.findMany({
      ...EFriend.Summary,
      where: { userprofile_id: userId },
      orderBy: [{ is_favorite: 'desc' }, { created_at: 'asc' }, { id: 'asc' }],
    })
  }

  async getFriend(userId: number, friendId: number): Promise<EFriend.Summary | null> {
    return this.txHost.tx.session_userprofile_friends.findFirst({
      ...EFriend.Summary,
      where: { id: friendId, userprofile_id: userId },
    })
  }

  async getFriendByTarget(userId: number, friendUserId: number): Promise<EFriend.Summary | null> {
    return this.txHost.tx.session_userprofile_friends.findUnique({
      ...EFriend.Summary,
      where: {
        userprofile_id_friend_userprofile_id: {
          userprofile_id: userId,
          friend_userprofile_id: friendUserId,
        },
      },
    })
  }

  async createPair(userId: number, friendUserId: number): Promise<void> {
    await this.txHost.tx.session_userprofile_friends.createMany({
      data: [
        { userprofile_id: userId, friend_userprofile_id: friendUserId },
        { userprofile_id: friendUserId, friend_userprofile_id: userId },
      ],
      skipDuplicates: true,
    })
  }

  async setFavorite(userId: number, friendId: number, isFavorite: boolean): Promise<void> {
    await this.txHost.tx.session_userprofile_friends.updateMany({
      where: { id: friendId, userprofile_id: userId },
      data: { is_favorite: isFavorite },
    })
  }

  async deletePair(userId: number, friendUserId: number): Promise<void> {
    await this.txHost.tx.session_userprofile_friends.deleteMany({
      where: {
        OR: [
          { userprofile_id: userId, friend_userprofile_id: friendUserId },
          { userprofile_id: friendUserId, friend_userprofile_id: userId },
        ],
      },
    })
  }

  async getFriendsWithCourse(userId: number, courseId: number): Promise<EFriend.WithCourseLectures[]> {
    return this.txHost.tx.session_userprofile_friends.findMany({
      ...EFriend.WithCourseLectures(courseId),
      where: {
        userprofile_id: userId,
        friend_profile: {
          OR: [
            { taken_lectures: { some: { lecture: { course_id: courseId } } } },
            {
              timetable_timetable: {
                some: { timetable_timetable_lectures: { some: { subject_lecture: { course_id: courseId } } } },
              },
            },
          ],
        },
      },
      orderBy: [{ is_favorite: 'desc' }, { created_at: 'asc' }, { id: 'asc' }],
    })
  }
}
