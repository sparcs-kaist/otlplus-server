import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { session_userprofile } from '@prisma/client';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { WishlistAddLectureDto } from 'src/common/interfaces/dto/wishlist/wishlist.request.dto';
import { toJsonWishlist } from 'src/common/interfaces/serializer/wishlist.serializer';
import { WishlistService } from './wishlist.service';

@Controller('api/users/:userId/wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  async getLectures(
    @Param('userId') userId: number,
    @GetUser() user: session_userprofile,
  ) {
    if (userId !== user.id) throw new UnauthorizedException(); // TODO: Better message
    const wishlist = await this.wishlistService.getWishlistWithLectures(
      user.id,
    );
    return toJsonWishlist(wishlist);
  }

  @Post('add-lecture')
  async addLecture(
    @Param('userId') userId: number,
    @Body() body: WishlistAddLectureDto,
    @GetUser() user: session_userprofile,
  ) {
    if (userId !== user.id) throw new UnauthorizedException(); // TODO: Better message
    const wishlist = await this.wishlistService.addLecture(user.id, body);
    return toJsonWishlist(wishlist);
  }

  @Post('remove-lecture')
  async removeLecture(
    @Param('userId') userId: number,
    @Body() body: WishlistAddLectureDto,
    @GetUser() user: session_userprofile,
  ) {
    if (userId !== user.id) throw new UnauthorizedException(); // TODO: Better message
    const wishlist = await this.wishlistService.removeLecture(user.id, body);
    return toJsonWishlist(wishlist);
  }
}
