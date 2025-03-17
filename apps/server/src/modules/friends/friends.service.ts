import { BadRequestException, Injectable } from '@nestjs/common';
import { IFriend } from '@otl/api-interface/src/interfaces';
import { FriendsRepository } from '@src/prisma/repositories/friends.repository';
import { UserRepository } from '@src/prisma/repositories/user.repository';

@Injectable()
export class FriendsService {
  constructor(
    private friendsRepository: FriendsRepository,
    private userRepository: UserRepository,
  ) {}

  async getFriends(userId: number): Promise<IFriend.Basic[]> {
    const friends = await this.friendsRepository.getFriends(userId);
    return friends.map((friend) => ({
      id: friend.id,
      user_profile: friend.friend,
      begin: friend.begin,
      isFavorite: friend.is_favorite,
    }));
  }

  async createFriend(userId: number, friendId: number): Promise<IFriend.Basic> {
    // 이미 친구인지 확인
    const isFriend = await this.friendsRepository.isFriend(userId, friendId);
    if (isFriend !== null) {
      const user = await this.userRepository.findByUserId(userId);
      throw new BadRequestException(
        `${isFriend.friend.first_name} ${isFriend.friend.last_name}님과 ${user.first_name} ${user.last_name} 님은 이미 친구입니다.`,
      );
    }

    const friend = await this.friendsRepository.createFriend(userId, friendId);
    const friendProfile = await this.userRepository.findByUserId(friendId);
    return {
      id: friend.id,
      user_profile: friendProfile,
      begin: friend.begin,
      isFavorite: friend.is_favorite,
    };
  }

  async updateFriendFavorite(userId: number, friendId: number, isFavorite: boolean): Promise<IFriend.Basic> {
    const friend = await this.friendsRepository.updateFriendFavorite(userId, friendId, isFavorite);
    return {
      id: friend.id,
      user_profile: friend.friend,
      begin: friend.begin,
      isFavorite: friend.is_favorite,
    };
  }

  async deleteFriend(userId: number, friendId: number): Promise<void> {
    await this.friendsRepository.deleteFriend(userId, friendId);
  }
}
