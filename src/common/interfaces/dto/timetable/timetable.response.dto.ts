import { CourseResponseDto } from "../course/course.response.dto";
import { LectureResponseDto } from "../lecture/lecture.response.dto";

export class TimetableResponseDto {
  id: number;
  lectures: LectureResponseDto[];
  arrange_order: number;
}
