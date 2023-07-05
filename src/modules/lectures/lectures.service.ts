import { Injectable } from '@nestjs/common';
import { LectureInstanceDto } from '../../common/interfaces/dto/lectures/lectures.response.dto';
import { LectureRepository } from '../../prisma/repositories/lecture.repository';

@Injectable()
export class LecturesService {
  constructor(private lecturesRepository: LectureRepository) {}

  async getLecture(lectureId: string): Promise<LectureInstanceDto> {
    const lecture = await this.lecturesRepository.findLectureById(lectureId);

    if (lecture === null)
      throw new LectureNotFound();
    else
      return lecture;
  }
}

export class EntityNotFoundException {}
export class LectureNotFound extends EntityNotFoundException {}
