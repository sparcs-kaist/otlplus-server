import { ILecture } from '../../ILecture';

export interface TimetableResponseDto {
  id: number;
  lectures: ILecture.Detail[];
  arrange_order: number;
}
