import {
  Body, Controller, Delete, Get, Header, Param, ParseIntPipe, Patch, Post, Query,
} from '@nestjs/common'
import { GetLanguage, Language } from '@otl/server-nest/common/decorators/get-language.decorator'
import { GetUser } from '@otl/server-nest/common/decorators/get-user.decorator'
import { IFriendV2, ITimetableV2 } from '@otl/server-nest/common/interfaces/v2'
import { session_userprofile } from '@prisma/client'

import { FriendsService } from './friends.service'

@Controller('/api/v2/friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get()
  @Header('Cache-Control', 'private, no-store')
  getFriends(@GetUser() user: session_userprofile) {
    return this.friendsService.getFriends(user)
  }

  @Post('/invites')
  @Header('Cache-Control', 'private, no-store')
  createInvite(@GetUser() user: session_userprofile) {
    return this.friendsService.createInvite(user)
  }

  @Post('/invites/accept')
  @Header('Cache-Control', 'private, no-store')
  acceptInvite(@GetUser() user: session_userprofile, @Body() body: IFriendV2.AcceptInviteReqDto) {
    return this.friendsService.acceptInvite(user, body.token)
  }

  @Get('/lectures/:lectureId/overlaps')
  @Header('Cache-Control', 'private, no-store')
  getOverlaps(@GetUser() user: session_userprofile, @Param('lectureId', ParseIntPipe) lectureId: number) {
    return this.friendsService.getOverlaps(user, lectureId)
  }

  @Patch('/:friendId/favorite')
  @Header('Cache-Control', 'private, no-store')
  updateFavorite(
    @GetUser() user: session_userprofile,
    @Param('friendId', ParseIntPipe) friendId: number,
    @Body() body: IFriendV2.UpdateFavoriteReqDto,
  ) {
    return this.friendsService.updateFavorite(user, friendId, body.isFavorite)
  }

  @Delete('/:friendId')
  @Header('Cache-Control', 'private, no-store')
  deleteFriend(@GetUser() user: session_userprofile, @Param('friendId', ParseIntPipe) friendId: number) {
    return this.friendsService.deleteFriend(user, friendId)
  }

  @Get('/:friendId/timetables')
  @Header('Cache-Control', 'private, no-store')
  getTimetables(
    @GetUser() user: session_userprofile,
    @Param('friendId', ParseIntPipe) friendId: number,
    @Query() query: ITimetableV2.GetTimetablesReqDto,
  ) {
    return this.friendsService.getTimetables(user, friendId, query)
  }

  @Get('/:friendId/timetables/my-timetable')
  @Header('Cache-Control', 'private, no-store')
  getMyTimetable(
    @GetUser() user: session_userprofile,
    @Param('friendId', ParseIntPipe) friendId: number,
    @Query() query: ITimetableV2.MyTimetableReqDto,
    @GetLanguage() language: Language,
  ) {
    return this.friendsService.getMyTimetable(user, friendId, query, language)
  }

  @Get('/:friendId/timetables/:timetableId')
  @Header('Cache-Control', 'private, no-store')
  getTimetable(
    @GetUser() user: session_userprofile,
    @Param('friendId', ParseIntPipe) friendId: number,
    @Param('timetableId', ParseIntPipe) timetableId: number,
    @GetLanguage() language: Language,
  ) {
    return this.friendsService.getTimetable(user, friendId, timetableId, language)
  }
}
