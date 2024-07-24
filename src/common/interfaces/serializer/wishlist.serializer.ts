import { EWishlist } from 'src/common/entities/EWishlist';
import { WishlistWithLecturesResponseDto } from '../dto/wishlist/wishlist.response.dto';
import { toJsonLectureDetail } from './lecture.serializer';

export const toJsonWishlist = (
  wishlist: EWishlist.WithLectures,
): WishlistWithLecturesResponseDto => {
  return {
    lectures: wishlist.timetable_wishlist_lectures.map((lecture) =>
      toJsonLectureDetail(lecture.subject_lecture),
    ),
  };
};
