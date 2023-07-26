import { Controller, Get, Query } from '@nestjs/common';
import { LecturesService } from './lectures.service';
import { LectureQueryDTO } from 'src/common/interfaces/dto/lecture/lecture.query.dto';

@Controller('api/lectures')
export class LecturesController {
  constructor(private readonly LectureService: LecturesService) {}

  @Get()
  async getLectures(@Query() query: LectureQueryDTO) {
    return await this.LectureService.getLectureByFilter(query);
  }
}
