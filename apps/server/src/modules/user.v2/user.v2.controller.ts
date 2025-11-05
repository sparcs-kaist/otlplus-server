import {
  BadRequestException, Body, Controller, Get, HttpException, Param, Put,
} from '@nestjs/common'
import { GetUser } from '@otl/server-nest/common/decorators/get-user.decorator'
import { ICourseV2, IUserV2 } from '@otl/server-nest/common/interfaces'
import { session_userprofile } from '@prisma/client'

import { userV2Service } from './user.v2.service'

@Controller('api/v2/users')
export class v2UserController {
  constructor(private readonly v2UserService: userV2Service) {}

  @Get('writable-review')
  async getUserTakenCourses(@GetUser() user: session_userprofile): Promise<ICourseV2.WritableReview | null> {
    if (user) {
      return this.v2UserService.getUnreviewedRandomCourse(user)
    }
    throw new HttpException('Can\'t find user', 401)
  }

  @Get(':userId/info')
  async getUserInfo(
    @GetUser() user: session_userprofile,
    @Param('userId') userId: number,
  ): Promise<IUserV2.Info | null> {
    if (userId === user.id) {
      return this.v2UserService.getUserInfo(user)
    }
    throw new HttpException('Invalid userId', 400)
  }

  @Put(':userId/interested-departments')
  async updateInterestedDepartments(
    @GetUser() user: session_userprofile,
    @Param('userId') userId: number,
    @Body('interestedDepartmentIds') departments: number[],
  ): Promise<void> {
    if (userId !== user.id) {
      throw new HttpException('Invalid userId', 400)
    }
    if (!Array.isArray(departments)) {
      throw new BadRequestException('interestedDepartmentIds must be number[]')
    }
    return this.v2UserService.updateInterestedDepartments(user, departments)
  }
}
