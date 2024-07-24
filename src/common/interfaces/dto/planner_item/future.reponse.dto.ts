import { ICourse } from '../../ICourse';

export interface FuturePlannerItemResponseDto {
  id: number;
  item_type: 'FUTURE';
  is_excluded: boolean;
  year: number;
  semester: number;
  course: ICourse.Basic;
}
