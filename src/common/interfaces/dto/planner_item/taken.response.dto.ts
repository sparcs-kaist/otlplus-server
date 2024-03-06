import { CourseResponseDto } from '../course/course.response.dto';
import { LectureResponseDto } from '../lecture/lecture.response.dto';

export interface TakenPlannerItemResponseDto {
  id: number;
  item_type: 'TAKEN';
  is_excluded: boolean;
  lecture: LectureResponseDto;
  course: CourseResponseDto;
}
