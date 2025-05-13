import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager'
import {
  BadRequestException, Controller, Get, Param, Post, Query, UseInterceptors,
} from '@nestjs/common'
import { GetUser } from '@otl/server-nest/common/decorators/get-user.decorator'
import { Public } from '@otl/server-nest/common/decorators/skip-auth.decorator'
import { ICourse, ILecture, IReview } from '@otl/server-nest/common/interfaces'
import { CourseIdPipe } from '@otl/server-nest/common/pipe/courseId.pipe'
import { session_userprofile } from '@prisma/client'

import { RedisTTL } from '@otl/common/enum/time'

import { CoursesService } from './courses.service'

@Controller('api/courses')
export class CourseController {
  constructor(private readonly coursesService: CoursesService) {}

  @Public()
  @CacheTTL(RedisTTL.HOUR)
  @UseInterceptors(CacheInterceptor)
  @Get()
  async getCourses(
    @Query() query: ICourse.Query,
    @GetUser() user: session_userprofile,
  ): Promise<ICourse.DetailWithIsRead[]> {
    const courses = await this.coursesService.getCourses(query, user)
    return courses
  }

  @Public()
  @CacheTTL(RedisTTL.HOUR)
  @UseInterceptors(CacheInterceptor)
  @Get('autocomplete')
  async getCourseAutocomplete(@Query() query: ICourse.AutocompleteQueryDto): Promise<string | undefined> {
    return await this.coursesService.getCourseAutocomplete(query)
  }

  @Public()
  @CacheTTL(RedisTTL.HOUR)
  @UseInterceptors(CacheInterceptor)
  @Get(':id')
  async getCourseById(
    @Param('id', CourseIdPipe) id: number,
    @GetUser() user: session_userprofile,
  ): Promise<ICourse.DetailWithIsRead> {
    if (Number.isNaN(id)) throw new BadRequestException('Invalid course id')
    return await this.coursesService.getCourseById(id, user)
  }

  @Public()
  @CacheTTL(RedisTTL.HOUR)
  @UseInterceptors(CacheInterceptor)
  @Get(':id/lectures')
  async getLecturesByCourseId(
    @Query() query: ICourse.LectureQueryDto,
    @Param('id', CourseIdPipe) id: number,
  ): Promise<ILecture.Detail[]> {
    return await this.coursesService.getLecturesByCourseId(query, id)
  }

  @Public()
  @Get(':id/reviews')
  async getReviewByCourseId(
    @Query() query: ICourse.ReviewQueryDto,
    @Param('id', CourseIdPipe) id: number,
    @GetUser() user: session_userprofile,
  ): Promise<IReview.Basic[]> {
    return await this.coursesService.getReviewsByCourseId(query, id, user)
  }

  @Post(':id/read')
  async readCourse(
    @Param('id', CourseIdPipe) id: number,
    @GetUser() user: session_userprofile,
  ): Promise<ICourse.ICourseUser.Basic> {
    return await this.coursesService.readCourse(user.id, id)
  }
}
