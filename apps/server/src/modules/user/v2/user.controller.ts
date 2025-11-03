import {
  Body, Controller, Get, Headers, Param, ParseIntPipe, Patch, UnauthorizedException,
} from '@nestjs/common'
import { GetUser } from '@otl/server-nest/common/decorators/get-user.decorator'
import { IUserV2 } from '@otl/server-nest/common/interfaces/v2'
import { session_userprofile } from '@prisma/client'

import { UserServiceV2 } from './user.service'

@Controller('/api/v2/users')
export class UserControllerV2 {
  constructor(private readonly userServiceV2: UserServiceV2) {}

  @Get(':userId/lectures')
  async getUserLectures(
    @Param('userId', ParseIntPipe) userId: number,
    @GetUser() user: session_userprofile,
    @Headers('Accept-Language') acceptLanguage: string,
  ): Promise<IUserV2.LecturesResponse> {
    if (userId !== user.id) {
      throw new UnauthorizedException('Current user does not match userId')
    }

    return await this.userServiceV2.getUserLectures(user, acceptLanguage)
  }

  @Get(':userId/wishlist')
  async getWishlist(
    @Param('userId', ParseIntPipe) userId: number,
    @GetUser() user: session_userprofile,
    @Headers('Accept-Language') acceptLanguage: string,
  ): Promise<IUserV2.WishlistResponse> {
    if (userId !== user.id) {
      throw new UnauthorizedException('Current user does not match userId')
    }

    return await this.userServiceV2.getWishlist(user, acceptLanguage)
  }

  @Patch(':userId/wishlist')
  async updateWishlist(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() body: IUserV2.UpdateWishlistDto,
    @GetUser() user: session_userprofile,
  ): Promise<void> {
    if (userId !== user.id) {
      throw new UnauthorizedException('Current user does not match userId')
    }

    await this.userServiceV2.updateWishlist(user, body)
  }
}
