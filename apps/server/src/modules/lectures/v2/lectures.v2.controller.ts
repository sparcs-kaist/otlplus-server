import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager'
import {
  Controller, ExecutionContext, Get, Query, UseInterceptors,
} from '@nestjs/common'
import { GetLanguage } from '@otl/server-nest/common/decorators/get-language.decorator'
import { GetUser } from '@otl/server-nest/common/decorators/get-user.decorator'
import { Public } from '@otl/server-nest/common/decorators/skip-auth.decorator'
import { ILectureV2 } from '@otl/server-nest/common/interfaces'
import { session_userprofile } from '@prisma/client'

import { LecturesServiceV2 } from './lectures.v2.service'

@Controller('api/v2/lectures')
export class LecturesControllerV2 {
  constructor(private readonly LectureService: LecturesServiceV2) {}

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

  @Get()
  async getLectures(
    @Query() query: ILectureV2.getQuery,
    @GetUser() user: session_userprofile,
    @GetLanguage() language: 'kr' | 'en',
  ): Promise<ILectureV2.courseWrapped> {
    return await this.LectureService.getLectureByFilter(query, user, language)
  }

  @Public()
  @CacheTTL(LecturesControllerV2.cacheTTLFactory)
  @UseInterceptors(CacheInterceptor)
  @Get('/public')
  async getLecturesPublic(
    @Query() query: ILectureV2.getQuery,
    @GetLanguage() language: 'kr' | 'en',
  ): Promise<ILectureV2.courseWrapped> {
    return await this.LectureService.getLectureByFilter(query, null, language)
  }
}
