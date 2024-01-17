import { DepartmentResponseDto } from '../department/department.response.dto';

export interface MajorTrackResponseDto {
  id: number;
  start_year: number;
  end_year: number;
  department: DepartmentResponseDto;
  basic_elective_doublemajor: number;
  major_required: number;
  major_elective: number;
}
