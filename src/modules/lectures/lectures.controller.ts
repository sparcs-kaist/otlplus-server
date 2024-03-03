import { Controller, Get, Param, Query } from '@nestjs/common';
import { session_userprofile } from '@prisma/client';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { Public } from 'src/common/decorators/skip-auth.decorator';
import { ILecture } from 'src/common/interfaces/ILecture';
import { IReview } from 'src/common/interfaces/IReview';
import { LectureQueryDto } from 'src/common/interfaces/dto/lecture/lecture.request.dto';
import { ReviewResponseDto } from 'src/common/interfaces/dto/reviews/review.response.dto';
import { LecturesService } from './lectures.service';

@Controller('api/lectures')
export class LecturesController {
  constructor(private readonly LectureService: LecturesService) {}

  @Get()
  async getLectures(@Query() query: LectureQueryDto) {
    return await this.LectureService.getLectureByFilter(query);
  }

  @Public()
  @Get('autocomplete')
  async getLectureAutocomplete(@Query() query: ILecture.AutocompleteDto) {
    return await this.LectureService.getLectureAutocomplete(query);
  }

  @Get(':id')
  async getLectureById(@Param('id') id: number) {
    return await this.LectureService.getLectureById(id);
  }

  @Public()
  @Get(':lectureId/reviews')
  async getLectureReviews(
    @Query() query: IReview.LectureReviewsQueryDto,
    @Param('lectureId') lectureId: number,
    @GetUser() user: session_userprofile,
  ): Promise<(ReviewResponseDto & { userspecific_is_liked: boolean })[]> {
    return await this.LectureService.getLectureReviews(user, lectureId, query);
  }

  @Public()
  @Get(':lectureId/related-reviews')
  async getLectureRelatedReviews(
    @Query() query: IReview.LectureReviewsQueryDto,
    @Param('lectureId') lectureId: number,
    @GetUser() user: session_userprofile,
  ): Promise<(ReviewResponseDto & { userspecific_is_liked: boolean })[]> {
    return await this.LectureService.getLectureRelatedReviews(
      user,
      lectureId,
      query,
    );
  }
}
