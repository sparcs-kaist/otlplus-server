import { IDepartment } from '../../IDepartment';

export interface MajorTrackResponseDto {
  id: number;
  start_year: number;
  end_year: number;
  department: IDepartment.Basic;
  basic_elective_doublemajor: number;
  major_required: number;
  major_elective: number;
}
