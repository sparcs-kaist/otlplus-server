import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager'
import {
  Controller, ExecutionContext, Get, Param, Query, UseInterceptors,
} from '@nestjs/common'
import { GetUser } from '@otl/server-nest/common/decorators/get-user.decorator'
import { Public } from '@otl/server-nest/common/decorators/skip-auth.decorator'
import { ILecture, IReview } from '@otl/server-nest/common/interfaces'
import { session_userprofile } from '@prisma/client'

import { LectureRepository, WishlistRepository } from '@otl/prisma-client'

import { LecturesService } from './lectures.service'

@Controller('api/lectures')
export class LecturesController {
  constructor(private readonly LectureService: LecturesService) {}

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
  @CacheTTL(LecturesController.cacheTTLFactory)
  @UseInterceptors(CacheInterceptor)
  @Get()
  async getLectures(@Query() query: ILecture.QueryDto): Promise<ILecture.Detail[]> {
    return await this.LectureService.getLectureByFilter(query)
  }

  @Public()
  @CacheTTL(LecturesController.cacheTTLFactory)
  @UseInterceptors(CacheInterceptor)
  @Get('autocomplete')
  async getLectureAutocomplete(@Query() query: ILecture.AutocompleteQueryDto): Promise<string | undefined> {
    return await this.LectureService.getLectureAutocomplete(query)
  }

  @Public()
  @CacheTTL(LecturesController.cacheTTLFactory)
  @UseInterceptors(CacheInterceptor)
  @Get(':id')
  async getLectureById(@Param('id') id: number): Promise<ILecture.Detail> {
    return await this.LectureService.getLectureById(id)
  }

  @Public()
  @Get(':lectureId/reviews')
  async getLectureReviews(
    @Query() query: IReview.LectureReviewsQueryDto,
    @Param('lectureId') lectureId: number,
    @GetUser() user: session_userprofile,
  ): Promise<IReview.WithLiked[]> {
    return await this.LectureService.getLectureReviews(user, lectureId, query)
  }

  @Public()
  @Get(':lectureId/related-reviews')
  async getLectureRelatedReviews(
    @Query() query: IReview.LectureReviewsQueryDto,
    @Param('lectureId') lectureId: number,
    @GetUser() user: session_userprofile,
  ): Promise<IReview.WithLiked[]> {
    return await this.LectureService.getLectureRelatedReviews(user, lectureId, query)
  }
}

@Controller('api/v2/lectures')
export class v2LecturesController {
  constructor(
    private readonly LectureService: LecturesService,
    private readonly lectureRepository: LectureRepository,
    private readonly wishlistRepository: WishlistRepository,
  ) {}

  // 필터링이 제대로 동작하지 않아 코드 수정이 필요함.
  @Public()
  @Get()
  async getLectures(
    @GetUser() user: session_userprofile,
    @Query() query: ILecture.v2QueryDto,
  ): Promise<ILecture.v2Response[] | ILecture.v2Response2[]> {
    return await this.LectureService.v2getLectureByFilter(query, this.lectureRepository, user, this.wishlistRepository)
  }
}
