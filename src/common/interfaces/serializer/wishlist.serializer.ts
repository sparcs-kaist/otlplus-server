import { WishlistWithLectures } from '../../schemaTypes/types';
import { WishlistWithLecturesResponseDto } from '../dto/wishlist/wishlist.response.dto';
import { toJsonLecture } from './lecture.serializer';

export const toJsonWishlist = (
  wishlist: WishlistWithLectures,
): WishlistWithLecturesResponseDto => {
  return {
    lectures: wishlist.timetable_wishlist_lectures.map((lecture) =>
      toJsonLecture(lecture.subject_lecture, true),
    ),
  };
};
