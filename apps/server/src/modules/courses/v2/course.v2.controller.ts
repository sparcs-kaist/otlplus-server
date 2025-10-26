import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager'
import {
  BadRequestException, Controller, ExecutionContext, Get, Param, Query, UseInterceptors,
} from '@nestjs/common'
import { GetUser } from '@otl/server-nest/common/decorators/get-user.decorator'
import { Public } from '@otl/server-nest/common/decorators/skip-auth.decorator'
import { ICourseV2 } from '@otl/server-nest/common/interfaces'
import { session_userprofile } from '@prisma/client'

import { CoursesServiceV2 } from './courses.v2.service'

@Controller('api/v2/courses')
export class CourseV2Controller {
  constructor(private readonly coursesService: CoursesServiceV2) {}

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
  @CacheTTL(CourseV2Controller.cacheTTLFactory)
  @UseInterceptors(CacheInterceptor)
  @Get()
  async getCourses(@Query() query: ICourseV2.Query, @GetUser() user: session_userprofile): Promise<ICourseV2.Basic[]> {
    const courses = await this.coursesService.getCourses(query, user)
    return courses
  }

  @Public()
  @CacheTTL(CourseV2Controller.cacheTTLFactory)
  @UseInterceptors(CacheInterceptor)
  @Get(':id')
  async getCourseById(
    @Param('id') id: number,
    @GetUser() user: session_userprofile,
    @Query('language') user_language: 'kr' | 'en' = 'kr',
  ): Promise<ICourseV2.Detail> {
    // 숫자 형식이 아닌 경우
    if (Number.isNaN(id)) throw new BadRequestException('Invalid course id')
    try {
      return await this.coursesService.getCourseById(id, user, user_language)
    }
    catch (error) {
      if (error === 'Invalid course id') {
        throw new BadRequestException('Invalid course id') // 400
      }
      else {
        throw error // 기타 에러 : 500
      }
    }
  }
}
