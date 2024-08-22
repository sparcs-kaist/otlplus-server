import { EWishlist } from 'src/common/entities/EWishlist';
import { IWishlist } from '../IWishlist';
import { toJsonLectureDetail } from './lecture.serializer';

export const toJsonWishlist = (
  wishlist: EWishlist.WithLectures,
): IWishlist.WithLectures => {
  return {
    lectures: wishlist.timetable_wishlist_lectures.map((lecture) =>
      toJsonLectureDetail(lecture.subject_lecture),
    ),
  };
};
