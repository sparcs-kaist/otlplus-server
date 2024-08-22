import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { session_userprofile } from '@prisma/client';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { Public } from 'src/common/decorators/skip-auth.decorator';
import { ICourse, ILecture } from 'src/common/interfaces';
import { CoursesService } from './courses.service';
import { IReview } from '../../common/interfaces/IReview';
import { ECourse } from '../../common/entities/ECourse';
import ECourseUser = ECourse.ECourseUser;

@Controller('api/courses')
export class CourseController {
  constructor(private readonly coursesService: CoursesService) {}

  @Public()
  @Get()
  async getCourses(
    @Query() query: ICourse.Query,
    @GetUser() user: session_userprofile,
  ): Promise<ICourse.DetailWithIsRead[]> {
    const courses = await this.coursesService.getCourses(query, user);
    return courses;
  }

  @Get('autocomplete')
  async getCourseAutocomplete(
    @Query() query: ICourse.AutocompleteQueryDto,
  ): Promise<string | undefined> {
    return await this.coursesService.getCourseAutocomplete(query);
  }

  @Public()
  @Get(':id')
  async getCourseById(
    @Param('id') id: number,
    @GetUser() user: session_userprofile,
  ): Promise<ICourse.DetailWithIsRead> {
    return await this.coursesService.getCourseById(id, user);
  }

  @Get(':id/lectures')
  async getLecturesByCourseId(
    @Query() query: { order: string[] },
    @Param('id') id: number,
  ): Promise<ILecture.Detail[]> {
    return await this.coursesService.getLecturesByCourseId(query, id);
  }

  @Get(':id/reviews')
  @Public()
  async getReviewByCourseId(
    @Query() query: ICourse.ReviewQueryDto,
    @Param('id') id: number,
    @GetUser() user: session_userprofile,
  ): Promise<IReview.Basic[]> {
    return await this.coursesService.getReviewsByCourseId(query, id, user);
  }

  @Post(':id/read')
  async readCourse(
    @Param('id') id: number,
    @GetUser() user: session_userprofile,
  ): Promise<ECourseUser.Basic> {
    return await this.coursesService.readCourse(user.id, id);
  }
}
