import { Controller, Get, HttpException, Param, Query } from '@nestjs/common';
import { session_userprofile } from '@prisma/client';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { ICourse } from 'src/common/interfaces';
import { IReview } from 'src/common/interfaces/IReview';
import {
  ReviewLikedQueryDto,
  UserTakenCoursesQueryDto,
} from 'src/common/interfaces/dto/user/user.request.dto';
import { UserService } from './user.service';

@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':user_id/taken-courses')
  async getUserTakenCourses(
    @Query() query: UserTakenCoursesQueryDto,
    @Param('user_id') userId: number,
    @GetUser() user: session_userprofile,
  ): Promise<ICourse.DetailWithIsRead[]> {
    if (userId === user.id) {
      return await this.userService.getUserTakenCourses(query, user);
    } else {
      throw new HttpException("Can't find user", 401);
    }
  }

  @Get(':user_id/liked-reviews')
  async getUserLikedReviews(
    @Query() query: ReviewLikedQueryDto,
    @Param('user_id') userId: number,
    @GetUser() user: session_userprofile,
  ): Promise<(IReview.Basic & { userspecific_is_liked: boolean })[]> {
    if (userId === user.id) {
      return await this.userService.getUserLikedReviews(user, userId, query);
    } else {
      throw new HttpException("Can't find user", 401);
    }
  }
}
