import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { IFriend } from '@otl/api-interface/src/interfaces';
import { session_userprofile } from '@prisma/client';
import { GetUser } from '@src/common/decorators/get-user.decorator';
import { FriendsService } from './friends.service';

Controller('api/friends');
export class FriendsController {
  constructor(private readonly FriendsService: FriendsService) {}

  /*
   * @description 친구 목록을 조회합니다.
   */
  @Get()
  async getFriends(@GetUser() user: session_userprofile): Promise<IFriend.Basic[]> {
    return await this.FriendsService.getFriends(user.id);
  }

  /*
   * @description 친구를 추가합니다.
   * body에 friend의 session_userprofile.id 값을 포함합니다.
   * 양방향 변경입니다. (a가 b를 삭제하면 b의 친구 목록에서도 삭제됩니다)
   */
  @Post()
  async createFriend(@GetUser() user: session_userprofile, @Body() body: IFriend.CreateDto): Promise<IFriend.Basic> {
    const friend_id = body.user_id;
    return await this.FriendsService.createFriend(user.id, friend_id);
  }

  /*
   * @description 친구의 즐겨찾기 여부를 수정합니다.
   * body에 isFavorite 값을 포함합니다.
   * 단방향 변경입니다. (a가 b의 즐겨찾기를 바꾸어도 b한테는 표기되지 않음)
   */
  @Patch('/:friendId/favorite ')
  async updateFriendFavorite(
    @GetUser() user: session_userprofile,
    @Param('friendId') friendId: number,
    @Body() body: IFriend.UpdateFavoriteDto,
  ): Promise<IFriend.Basic> {
    return await this.FriendsService.updateFriendFavorite(user.id, friendId, body.isFavorite);
  }

  /*
   * @description 친구를 삭제합니다.
   * 양방향 변경입니다. (a가 b를 삭제하면 b의 친구 목록에서도 삭제됩니다)
   */
  @Delete('/:friendId')
  async deleteFriend(@GetUser() user: session_userprofile, @Param('friendId') friendId: number): Promise<void> {
    await this.FriendsService.deleteFriend(user.id, friendId);
  }

  // TODO:
  // 위 api들 테스트 하기
  // 나머지 api 구현하기
}
