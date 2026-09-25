import { Injectable } from '@nestjs/common'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { Prisma, subject_semester } from '@prisma/client'
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

  async getFriendIdsWithScheduleAt(
    userId: number,
    friendIds: number[],
    semesters: Pick<subject_semester, 'year' | 'semester'>[],
    day: number,
    minute: number,
  ): Promise<number[]> {
    if (friendIds.length === 0 || semesters.length === 0) return []

    // Prisma represents MySQL TIME as a UTC Date, while custom blocks store minutes.
    const time = new Date(Date.UTC(1970, 0, 1, 0, minute))
    const classtime = { day, begin: { lte: time }, end: { gt: time } }
    const customBlock = { day, begin: { lte: minute }, end: { gt: minute } }
    const matches = await this.txHost.tx.session_userprofile_friends.findMany({
      select: { id: true },
      where: {
        userprofile_id: userId,
        id: { in: friendIds },
        friend_profile: {
          OR: semesters.flatMap((term): Prisma.session_userprofileWhereInput[] => {
            const lecture = { ...term, deleted: false, subject_classtime: { some: classtime } }
            return [
              { taken_lectures: { some: { lecture } } },
              {
                timetable_timetable: {
                  some: {
                    ...term,
                    OR: [
                      { timetable_timetable_lectures: { some: { subject_lecture: lecture } } },
                      { timetable_timetable_customblocks: { some: { block_custom_blocks: customBlock } } },
                    ],
                  },
                },
              },
            ]
          }),
        },
      },
    })
    // The parent is the canonical first occurrence, including legacy server edits.
    // Only later child rows supplement it; the first child can be stale.
    const extraMatches = await this.txHost.tx.$queryRaw<{ id: number }[]>(Prisma.sql`
      SELECT friend.id
      FROM session_userprofile_friends AS friend
      WHERE friend.userprofile_id = ${userId}
        AND friend.id IN (${Prisma.join(friendIds)})
        AND EXISTS (
          SELECT 1 FROM timetable_timetable AS timetable
          JOIN timetable_timetable_customblocks AS mapping ON mapping.timetable_id = timetable.id
          JOIN block_custom_block_times AS slot ON slot.custom_block_id = mapping.custom_block_id
          WHERE timetable.user_id = friend.friend_userprofile_id
            AND (${Prisma.join(semesters.map(({ year, semester }) => Prisma.sql`(timetable.year = ${year} AND timetable.semester = ${semester})`), ' OR ')})
            AND slot.day = ${day} AND slot.begin <= ${minute} AND slot.end > ${minute}
            AND EXISTS (
              SELECT 1 FROM block_custom_block_times AS first_slot
              WHERE first_slot.custom_block_id = slot.custom_block_id AND first_slot.id < slot.id
            )
        )
    `)
    return [...new Set([...matches, ...extraMatches].map(({ id }) => id))]
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
