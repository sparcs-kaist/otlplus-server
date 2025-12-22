import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Put,
  UnauthorizedException,
} from '@nestjs/common'
import { GetLanguage, Language } from '@otl/server-nest/common/decorators/get-language.decorator'
import { GetUser } from '@otl/server-nest/common/decorators/get-user.decorator'
import { ICourseV2, IUserV2 } from '@otl/server-nest/common/interfaces/v2'
import { IReviewV2 } from '@otl/server-nest/common/interfaces/v2/IReviewV2'
import { session_userprofile } from '@prisma/client'

import { UserServiceV2 } from './user.service'

@Controller('/api/v2/users')
export class UserControllerV2 {
  constructor(private readonly userServiceV2: UserServiceV2) {}

  @Get('writable-review')
  async getUserTakenCourses(
    @GetUser() user: session_userprofile,
    @GetLanguage() language: Language,
  ): Promise<ICourseV2.WritableReview | null> {
    if (user) {
      return this.userServiceV2.getUnreviewedRandomCourse(user, language)
    }
    throw new HttpException('Can\'t find user', 401)
  }

  @Get('info')
  async getUserInfo(@GetUser() user: session_userprofile): Promise<IUserV2.Info | null> {
    return this.userServiceV2.getUserInfo(user)
  }

  @Put(':userId/interested-departments')
  async updateInterestedDepartments(
    @GetUser() user: session_userprofile,
    @Param('userId', ParseIntPipe) userId: number,
    @Body('interestedDepartmentIds') departments: number[],
  ): Promise<void> {
    if (userId !== user.id) {
      throw new HttpException('Invalid userId', 400)
    }
    if (!Array.isArray(departments)) {
      throw new BadRequestException('interestedDepartmentIds must be number[]')
    }
    return this.userServiceV2.updateInterestedDepartments(user, departments)
  }

  @Get(':userId/lectures')
  async getUserLectures(
    @Param('userId', ParseIntPipe) userId: number,
    @GetUser() user: session_userprofile,
    @GetLanguage() language: Language,
  ): Promise<IUserV2.LecturesResponse> {
    if (userId !== user.id) {
      throw new UnauthorizedException('Current user does not match userId')
    }

    return await this.userServiceV2.getUserLectures(user, language)
  }

  @Get(':userId/wishlist')
  async getWishlist(
    @Param('userId', ParseIntPipe) userId: number,
    @GetUser() user: session_userprofile,
    @GetLanguage() language: Language,
  ): Promise<IUserV2.WishlistResponse> {
    if (userId !== user.id) {
      throw new UnauthorizedException('Current user does not match userId')
    }

    return await this.userServiceV2.getWishlist(user, language)
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

  @Get(':userId/reviews/liked')
  async getUserLikedReviews(
    @Param('userId', ParseIntPipe) userId: number,
    @GetUser() user: session_userprofile,
    @GetLanguage() language: string,
  ): Promise<{ reviews: IReviewV2.Basic[] }> {
    if (userId !== user.id) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED)
    }
    const reviews = await this.userServiceV2.getUserLikedReviews(user, language)
    return { reviews }
  }
}
