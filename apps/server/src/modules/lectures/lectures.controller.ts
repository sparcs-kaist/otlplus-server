import {
  Controller, Get, Param, Query,
} from '@nestjs/common'
import { GetUser } from '@otl/server-nest/common/decorators/get-user.decorator'
import { Public } from '@otl/server-nest/common/decorators/skip-auth.decorator'
import { ILecture, IReview } from '@otl/server-nest/common/interfaces'
import { session_userprofile } from '@prisma/client'

import { LecturesService } from './lectures.service'

@Controller('api/lectures')
export class LecturesController {
  constructor(private readonly LectureService: LecturesService) {}

  @Public()
  @Get()
  async getLectures(@Query() query: ILecture.QueryDto): Promise<ILecture.Detail[]> {
    return await this.LectureService.getLectureByFilter(query)
  }

  @Public()
  @Get('autocomplete')
  async getLectureAutocomplete(@Query() query: ILecture.AutocompleteQueryDto): Promise<string | undefined> {
    return await this.LectureService.getLectureAutocomplete(query)
  }

  @Public()
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
  ): Promise<(IReview.Basic & { userspecific_is_liked: boolean })[]> {
    return await this.LectureService.getLectureReviews(user, lectureId, query)
  }

  @Public()
  @Get(':lectureId/related-reviews')
  async getLectureRelatedReviews(
    @Query() query: IReview.LectureReviewsQueryDto,
    @Param('lectureId') lectureId: number,
    @GetUser() user: session_userprofile,
  ): Promise<(IReview.Basic & { userspecific_is_liked: boolean })[]> {
    return await this.LectureService.getLectureRelatedReviews(user, lectureId, query)
  }
}
