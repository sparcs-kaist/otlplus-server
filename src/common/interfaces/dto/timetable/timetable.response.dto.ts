import { LectureResponseDto } from '../lecture/lecture.response.dto';

export interface TimetableResponseDto {
  id: number;
  lectures: LectureResponseDto[];
  arrange_order: number;
}
