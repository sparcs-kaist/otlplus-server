import { DepartmentResponseDto } from '../department/department.response.dto';

export interface ArbitraryPlannerItemResponseDto {
  id: number;
  item_type: 'ARBITRARY';
  is_excluded: boolean;
  year: number;
  semester: number;
  department: DepartmentResponseDto;
  type: string;
  type_en: string;
  credit: number;
  credit_au: number;
}
