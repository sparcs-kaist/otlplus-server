import { Controller, Get, HttpException, Param, Query } from '@nestjs/common';
import { session_userprofile } from '@prisma/client';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { CourseResponseDtoNested } from 'src/common/interfaces/dto/course/course.response.dto';
import {
  UserFeedsQueryDto,
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
  ): Promise<(CourseResponseDtoNested & { userspecific_is_read: boolean })[]> {
    if (userId === user.id) {
      return await this.userService.getUserTakenCourses(query, user);
    } else {
      throw new HttpException("Can't find user", 401);
    }
  }

  @Get(':user_id/feeds')
  async getUserFeeds(
    /**
     * @todo use user by auth instead of userId by endpoint param
     * userId should be removed from endpoint in the future
     * since each user should only control their own timetable
     */
    @Query() query: UserFeedsQueryDto,
    @GetUser() user: session_userprofile,
  ): Promise<void> {
    return await this.userService.getUserFeeds(query, user);
  }
}
