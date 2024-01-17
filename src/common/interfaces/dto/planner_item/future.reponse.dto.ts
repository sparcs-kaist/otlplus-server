import { CourseResponseDto } from '../course/course.response.dto';

export interface FuturePlannerItemResponseDto {
  id: number;
  item_type: 'FUTURE';
  is_excluded: boolean;
  year: number;
  semester: number;
  course: CourseResponseDto;
}
