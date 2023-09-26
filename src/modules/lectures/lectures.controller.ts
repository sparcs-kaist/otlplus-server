import { Controller, Get, Param, Query } from '@nestjs/common';
import { LecturesService } from './lectures.service';
import { LectureQueryDto, LectureReviewsQueryDto } from 'src/common/interfaces/dto/lecture/lecture.request.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { ReviewResponseDto } from 'src/common/interfaces/dto/reviews/review.response.dto';
import { Public } from 'src/common/decorators/skip-auth.decorator';

@Controller('api/lectures')
export class LecturesController {
  constructor(private readonly LectureService: LecturesService) {}

  @Get()
  async getLectures(@Query() query: LectureQueryDto) {
    return await this.LectureService.getLectureByFilter(query);
  }

  @Get(':id')
  async getLectureById(@Param('id') id: number) {
    return await this.LectureService.getLectureById(id);
  }

  @Public()
  @Get(':lectureId/reviews')
  async getLectureReviews(
    @Query() query: LectureReviewsQueryDto,
    @Param('lectureId') lectureId: number,
    @GetUser() user,
  ): Promise<(ReviewResponseDto & { userspecific_is_liked: boolean })[]> {
    return await this.LectureService.getLectureReviews(user, lectureId, query);
  }
}
