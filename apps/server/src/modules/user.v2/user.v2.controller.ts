import { Controller, Get, HttpException } from '@nestjs/common'
import { GetUser } from '@otl/server-nest/common/decorators/get-user.decorator'
import { ICourse } from '@otl/server-nest/common/interfaces'
import { session_userprofile } from '@prisma/client'

import { v2UserService } from './user.v2.service'

@Controller('api/v2/users')
export class v2UserController {
  constructor(private readonly v2userService: v2UserService) {}

  @Get('writable-review')
  async getUserTakenCourses(@GetUser() user: session_userprofile): Promise<ICourse.WritableReview | null> {
    if (user) {
      return this.v2userService.getUnreviewedRandomCourse(user)
    }
    throw new HttpException('Can\'t find user', 401)
  }
  /*
  @Get(':user_id/info')
  async getUserInfo(
    @GetUser() user: session_userprofile,
    @Param('user_id') userId: number,
  ): Promise<IUser.Info | null> {
    if (userId === user.id) {
      return this.v2UserService.getUserInfo(user)
    }
    throw new HttpException('Can\'t find user', 401)
  } */
}
