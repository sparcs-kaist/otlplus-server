import { Controller, Get, Param, Query } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { session_userprofile } from '@prisma/client';

@Controller('api/courses')
export class CourseController {
  constructor(private readonly CoursesService: CoursesService) {}

  @Get()
  async getCourses(@Query() query: any, @GetUser() user: session_userprofile) {
    const courses = await this.CoursesService.getCourseByFilter(query, user);

    return courses
  }

  @Get(':id')
  async getCourseById(@Param('id') id: number, @GetUser() user: session_userprofile) {
    return await this.CoursesService.getCourseById(id, user);
  }

  @Get(':id/lectures')
  async getLecturesByCourseId(@Param('id') id: number, @GetUser() user: session_userprofile) {
    return await this.CoursesService.getLecturesByCourseId(id, user);
  }
}
