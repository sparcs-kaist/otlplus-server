import { LectureQueryDto } from 'src/common/interfaces/dto/lecture/lecture.request.dto';
import { LectureRepository } from './../../prisma/repositories/lecture.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { toJsonLecture } from 'src/common/interfaces/serializer/lecture.serializer';
import { LectureResponseDto } from 'src/common/interfaces/dto/lecture/lecture.response.dto';

@Injectable()
export class LecturesService {
  constructor(private LectureRepository: LectureRepository) {}

  public async getLectureByFilter(query: LectureQueryDto): Promise<LectureResponseDto[]> {
    const queryResult = await this.LectureRepository.filterByRequest(query);
    return queryResult.map((lecture) => toJsonLecture<false>(lecture, false))
  }

  public async getLectureById(id: number): Promise<LectureResponseDto> {
    const queryResult = await this.LectureRepository.getLectureById(id);
    if (!queryResult) {
      throw new NotFoundException();
    }
    return toJsonLecture<false>(queryResult, false);
  }
}
