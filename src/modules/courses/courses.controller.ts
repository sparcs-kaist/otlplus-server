import { CourseRepository } from './../../prisma/repositories/course.repository';
import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { CoursesService } from './courses.service';

@Controller('api/courses')
export class CourseController {
  constructor(private readonly CoursesService: CoursesService) {}

  @Get()
  async getCourses(@Query() query: any) {
    const courses = await this.CoursesService.getCourseByFilter(query);

    return courses
  }
}
