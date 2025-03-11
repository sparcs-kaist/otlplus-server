import { Body, Controller, Get, Post } from '@nestjs/common';
import { IFriend } from '@otl/api-interface/src/interfaces';
import { session_userprofile } from '@prisma/client';
import { GetUser } from '@src/common/decorators/get-user.decorator';
import { FriendsService } from './friends.service';

Controller('api/friends');
export class FriendsController {
  constructor(private readonly FriendsService: FriendsService) {}

  @Get()
  async getFriends(@GetUser() user: session_userprofile): Promise<IFriend.Basic[]> {
    return await this.FriendsService.getFriends(user.id);
  }

  @Post()
  async createFriend(@GetUser() user: session_userprofile, @Body() friend_id: number): Promise<IFriend.Basic> {
    return await this.FriendsService.createFriend(user.id, friend_id);
  }

  // TODO:
  // 위 api들 테스트 하기
  // 나머지 api 구현하기
}
