import { IDepartment } from '../../IDepartment';
import { AdditionalTrackType } from '../../constants/additional.track.response.dto';

export interface AdditionalTrackResponseDto {
  id: number;
  start_year: number;
  end_year: number;
  type: AdditionalTrackType;
  department: IDepartment.Basic | null;
  major_required: number;
  major_elective: number;
}
