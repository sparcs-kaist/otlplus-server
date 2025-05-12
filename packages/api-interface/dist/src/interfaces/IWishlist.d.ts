import { ILecture } from '@otl/api-interface/src/interfaces';
export declare namespace IWishlist {
  interface WithLectures {
    lectures: ILecture.Basic[];
  }
  class AddLectureDto {
    lecture: number;
  }
  class RemoveLectureDto {
    lecture: number;
  }
}
