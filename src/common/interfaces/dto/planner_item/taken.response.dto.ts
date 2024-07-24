import { ICourse } from '../../ICourse';
import { ILecture } from '../../ILecture';

export interface TakenPlannerItemResponseDto {
  id: number;
  item_type: 'TAKEN';
  is_excluded: boolean;
  lecture: ILecture.DetailedResponse;
  course: ICourse.Basic;
}
