import { Controller, Get, HttpException, Param, Query } from "@nestjs/common";
import { UserService } from "./user.service";
import { GetUser } from "src/common/decorators/get-user.decorator";
import { session_userprofile } from "@prisma/client";
import { UserTakenCoursesQueryDto } from "src/common/interfaces/dto/user/user.request.dto";
import { CourseResponseDtoNested } from "src/common/interfaces/dto/course/course.response.dto";

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
      return await this.userService.getUserTakenCourses(
        query,
        user,
      );
    } else {
      throw new HttpException("Can't find user", 401);
    }
  }
}
