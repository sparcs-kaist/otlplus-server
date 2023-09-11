import { Controller, Get, Param, Query } from '@nestjs/common';
import { LectureQueryDto } from 'src/common/interfaces/dto/lecture/lecture.request.dto';
import { LecturesService } from './lectures.service';

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
}
