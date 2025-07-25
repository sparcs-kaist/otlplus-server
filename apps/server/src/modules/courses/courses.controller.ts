import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager'
import {
  BadRequestException,
  Controller,
  ExecutionContext,
  Get,
  Param,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common'
import { GetUser } from '@otl/server-nest/common/decorators/get-user.decorator'
import { Public } from '@otl/server-nest/common/decorators/skip-auth.decorator'
import { ICourse, ILecture, IReview } from '@otl/server-nest/common/interfaces'
import { CourseIdPipe } from '@otl/server-nest/common/pipe/courseId.pipe'
import { session_userprofile } from '@prisma/client'

import { CoursesService } from './courses.service'

@Controller('api/courses')
export class CourseController {
  constructor(private readonly coursesService: CoursesService) {}

  private static cacheTTLFactory = (_context: ExecutionContext): number => {
    const now = new Date()

    // KST 기준 현재 시간
    const KST_OFFSET = 9 * 60
    const nowKST = new Date(now.getTime() + KST_OFFSET * 60 * 1000)

    // 다음 정각 계산
    const nextHourKST = new Date(nowKST)
    nextHourKST.setMinutes(0, 0, 0) // 정각으로 초기화
    nextHourKST.setHours(nowKST.getHours() + 1) // 다음 시간으로 이동

    // TTL 계산 (ms 단위)
    let ttlInMs = nextHourKST.getTime() - nowKST.getTime()

    // Jitter: 최대 60초까지 감산
    const jitterMs = Math.floor(Math.random() * 60_000) // 0~59,999 ms
    ttlInMs += jitterMs

    return ttlInMs
  }

  @Public()
  @CacheTTL(CourseController.cacheTTLFactory)
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
  @CacheTTL(CourseController.cacheTTLFactory)
  @UseInterceptors(CacheInterceptor)
  @Get('autocomplete')
  async getCourseAutocomplete(@Query() query: ICourse.AutocompleteQueryDto): Promise<string | undefined> {
    return await this.coursesService.getCourseAutocomplete(query)
  }

  @Public()
  @CacheTTL(CourseController.cacheTTLFactory)
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
  @CacheTTL(CourseController.cacheTTLFactory)
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
