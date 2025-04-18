import { EWishlist } from '@otl/prisma-client/entities'

import { IWishlist } from '../interfaces/IWishlist'
import { toJsonLectureDetail } from './lecture.serializer'

export const toJsonWishlist = (wishlist: EWishlist.WithLectures): IWishlist.WithLectures => ({
  lectures: wishlist.timetable_wishlist_lectures.map((lecture) => toJsonLectureDetail(lecture.subject_lecture)),
})
