import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { session_userprofile } from '@prisma/client';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { Public } from 'src/common/decorators/skip-auth.decorator';
import { ICourse } from 'src/common/interfaces';
import { CourseReviewQueryDto } from 'src/common/interfaces/dto/course/course.review.request.dto';
import { CourseQueryDto } from '../../common/interfaces/dto/course/course.request.dto';
import { CoursesService } from './courses.service';

@Controller('api/courses')
export class CourseController {
  constructor(private readonly coursesService: CoursesService) {}

  @Public()
  @Get()
  async getCourses(
    @Query() query: CourseQueryDto,
    @GetUser() user: session_userprofile,
  ) {
    const courses = await this.coursesService.getCourses(query, user);
    return courses;
  }

  @Get('autocomplete')
  async getCourseAutocomplete(@Query() query: ICourse.AutocompleteDto) {
    return await this.coursesService.getCourseAutocomplete(query);
  }

  @Public()
  @Get(':id')
  async getCourseById(
    @Param('id') id: number,
    @GetUser() user: session_userprofile,
  ) {
    return await this.coursesService.getCourseById(id, user);
  }

  @Get(':id/lectures')
  async getLecturesByCourseId(
    @Query() query: { order: string[] },
    @Param('id') id: number,
  ) {
    return await this.coursesService.getLecturesByCourseId(query, id);
  }

  @Get(':id/reviews')
  @Public()
  async getReviewByCourseId(
    @Query() query: CourseReviewQueryDto,
    @Param('id') id: number,
    @GetUser() user: session_userprofile,
  ) {
    return await this.coursesService.getReviewsByCourseId(query, id, user);
  }

  @Post(':id/read')
  async readCourse(
    @Param('id') id: number,
    @GetUser() user: session_userprofile,
  ) {
    await this.coursesService.readCourse(user.id, id);
  }
}
