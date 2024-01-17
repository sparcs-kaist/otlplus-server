import { AddtionalTrackType } from '../../constants/track';
import { DepartmentResponseDto } from '../department/department.response.dto';

export interface AdditionalTrackResponseDto {
  id: number;
  start_year: number;
  end_year: number;
  type: AddtionalTrackType;
  department: DepartmentResponseDto | null;
  major_required: number;
  major_elective: number;
}
