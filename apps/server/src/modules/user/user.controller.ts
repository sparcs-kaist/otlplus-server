import {
  Controller, Get, HttpException, Param, Query,
} from '@nestjs/common'
import { GetUser } from '@otl/server-nest/common/decorators/get-user.decorator'
import { ICourse, IReview, IUser } from '@otl/server-nest/common/interfaces'
import { session_userprofile } from '@prisma/client'

import { UserService } from './user.service'

@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':user_id/taken-courses')
  async getUserTakenCourses(
    @Query() query: IUser.TakenCoursesQueryDto,
    @Param('user_id') userId: number,
    @GetUser() user: session_userprofile,
  ): Promise<ICourse.DetailWithIsRead[]> {
    if (userId === user.id) {
      return await this.userService.getUserTakenCourses(query, user)
    }
    throw new HttpException('Can\'t find user', 401)
  }

  @Get(':user_id/liked-reviews')
  async getUserLikedReviews(
    @Query() query: IUser.ReviewLikedQueryDto,
    @Param('user_id') userId: number,
    @GetUser() user: session_userprofile,
  ): Promise<IReview.WithLiked[]> {
    if (userId === user.id) {
      return await this.userService.getUserLikedReviews(user, userId, query)
    }
    throw new HttpException('Can\'t find user', 401)
  }
}
