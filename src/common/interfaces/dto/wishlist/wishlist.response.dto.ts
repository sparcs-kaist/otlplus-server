import { NestedLectureResponseDto } from '../lecture/lecture.response.dto';

export interface WishlistWithLecturesResponseDto {
  lectures: NestedLectureResponseDto[];
}
