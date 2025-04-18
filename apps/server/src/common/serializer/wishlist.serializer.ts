import { EWishlist } from '@otl/prisma-client/entities';
import { toJsonLectureDetail } from './lecture.serializer';
import { IWishlist } from '../interfaces/IWishlist';

export const toJsonWishlist = (wishlist: EWishlist.WithLectures): IWishlist.WithLectures => {
  return {
    lectures: wishlist.timetable_wishlist_lectures.map((lecture) => toJsonLectureDetail(lecture.subject_lecture)),
  };
};
