export interface GeneralTrackResponseDto {
  id: number;
  start_year: number;
  end_year: number;
  is_foreign: boolean;
  total_credit: number;
  total_au: number;
  basic_required: number;
  basic_elective: number;
  thesis_study: number;
  thesis_study_doublemajor: number;
  general_required_credit: number;
  general_required_au: number;
  humanities: number;
  humanities_doublemajor: number;
}
