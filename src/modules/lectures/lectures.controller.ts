import { Controller, Get, Header, NotFoundException, Param } from '@nestjs/common';
import { EntityNotFoundException, LectureNotFound, LecturesService } from './lectures.service';
import { LectureInstanceDto } from 'src/common/interfaces/dto/lectures/lectures.response.dto';

@Controller('lectures')
export class LecturesController {
  constructor(private lecturesService: LecturesService) {}

  @Get()
  async listLectures() {}

  @Get(":lectureId")
  @Header("Content-Type", "application/json")
  async getLecture(
    @Param("lectureId") lectureId: string
  ): Promise<LectureInstanceDto> {
    try {
      return await this.lecturesService.getLecture(lectureId);
    } catch (e) {
      if (e instanceof EntityNotFoundException)
        throw new NotFoundException();
      else
        throw e;
    }
  }
}
