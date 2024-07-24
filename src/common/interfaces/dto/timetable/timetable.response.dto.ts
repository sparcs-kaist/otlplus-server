import { ILecture } from '../../ILecture';

export interface TimetableResponseDto {
  id: number;
  lectures: ILecture.DetailedResponse[];
  arrange_order: number;
}
