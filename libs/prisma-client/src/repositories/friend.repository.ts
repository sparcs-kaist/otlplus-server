import { Injectable } from '@nestjs/common'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'

import { EFriend } from '@otl/prisma-client/entities/EFriend'

@Injectable()
export class FriendRepository {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterPrisma>) {}

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

  async getFriendsWithTakenCourse(userId: number, courseId: number): Promise<EFriend.WithTakenLectures[]> {
    return this.txHost.tx.session_userprofile_friends.findMany({
      ...EFriend.WithTakenLectures(courseId),
      where: {
        userprofile_id: userId,
        friend_profile: {
          taken_lectures: { some: { lecture: { course_id: courseId } } },
        },
      },
      orderBy: [{ is_favorite: 'desc' }, { created_at: 'asc' }, { id: 'asc' }],
    })
  }
}
