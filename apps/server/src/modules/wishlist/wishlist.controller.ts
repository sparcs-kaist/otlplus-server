import {
  Body, Controller, Get, Param, Post, UnauthorizedException,
} from '@nestjs/common'
import { GetUser } from '@otl/server-nest/common/decorators/get-user.decorator'
import { IWishlist } from '@otl/server-nest/common/interfaces'
import { toJsonWishlist } from '@otl/server-nest/common/serializer/wishlist.serializer'
import { session_userprofile } from '@prisma/client'

import { WishlistService } from './wishlist.service'

@Controller('api/users/:userId/wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  async getWishlist(
    @Param('userId') userId: number,
    @GetUser() user: session_userprofile,
  ): Promise<IWishlist.WithLectures> {
    if (userId !== user.id) throw new UnauthorizedException() // TODO: Better message
    const wishlist = await this.wishlistService.getWishlistWithLectures(user.id)
    return toJsonWishlist(wishlist)
  }

  @Post('add-lecture')
  async addLecture(
    @Param('userId') userId: number,
    @Body() body: IWishlist.AddLectureDto,
    @GetUser() user: session_userprofile,
  ): Promise<IWishlist.WithLectures> {
    if (userId !== user.id) throw new UnauthorizedException() // TODO: Better message
    const wishlist = await this.wishlistService.addLecture(user.id, body)
    return toJsonWishlist(wishlist)
  }

  @Post('remove-lecture')
  async removeLecture(
    @Param('userId') userId: number,
    @Body() body: IWishlist.RemoveLectureDto,
    @GetUser() user: session_userprofile,
  ): Promise<IWishlist.WithLectures> {
    if (userId !== user.id) throw new UnauthorizedException() // TODO: Better message
    const wishlist = await this.wishlistService.removeLecture(user.id, body)
    return toJsonWishlist(wishlist)
  }
}
