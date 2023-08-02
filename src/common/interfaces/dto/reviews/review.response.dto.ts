import { CourseResponseDto } from "../course/course.response.dto";

export class ReviewResponseDto {
  id: number;
  course: CourseResponseDto;
  lecture: any;//LectureResponseDto;
  content: string;
  like: number;
  is_deleted: number;
  grade: number;
  load: number;
  speech: number;
}
