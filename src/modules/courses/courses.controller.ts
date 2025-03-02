import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { session_userprofile } from '@prisma/client';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { Public } from 'src/common/decorators/skip-auth.decorator';
import { ICourse } from 'src/common/interfaces';
import { CoursesService } from './courses.service';
import { CourseIdPipe } from '@src/common/pipe/courseId.pipe';
import LectureQueryDto = ICourse.LectureQueryDto;

@Controller('api/courses')
export class CourseController {
  constructor(private readonly coursesService: CoursesService) {}

  @Public()
  @Get()
  async getCourses(
    @Query() query: ICourse.Query,
    @GetUser() user: session_userprofile,
  ) {
    const courses = await this.coursesService.getCourses(query, user);
    return courses;
  }

  @Public()
  @Get('autocomplete')
  async getCourseAutocomplete(@Query() query: ICourse.AutocompleteQueryDto) {
    return await this.coursesService.getCourseAutocomplete(query);
  }

  @Public()
  @Get(':id')
  async getCourseById(
    @Param('id', CourseIdPipe) id: number,
    @GetUser() user: session_userprofile,
  ) {
    if (isNaN(id)) throw new BadRequestException('Invalid course id');
    return await this.coursesService.getCourseById(id, user);
  }

  @Public()
  @Get(':id/lectures')
  async getLecturesByCourseId(
    @Query() query: LectureQueryDto,
    @Param('id', CourseIdPipe) id: number,
  ) {
    return await this.coursesService.getLecturesByCourseId(query, id);
  }

  @Public()
  @Get(':id/reviews')
  async getReviewByCourseId(
    @Query() query: ICourse.ReviewQueryDto,
    @Param('id', CourseIdPipe) id: number,
    @GetUser() user: session_userprofile,
  ) {
    return await this.coursesService.getReviewsByCourseId(query, id, user);
  }

  @Post(':id/read')
  async readCourse(
    @Param('id', CourseIdPipe) id: number,
    @GetUser() user: session_userprofile,
  ) {
    await this.coursesService.readCourse(user.id, id);
  }
}
