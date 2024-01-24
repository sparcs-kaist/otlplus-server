import { AdditionalTrackType } from '../../constants/additional.track.response.dto';
import { DepartmentResponseDto } from '../department/department.response.dto';

export interface AdditionalTrackResponseDto {
  id: number;
  start_year: number;
  end_year: number;
  type: AdditionalTrackType;
  department: DepartmentResponseDto | null;
  major_required: number;
  major_elective: number;
}
