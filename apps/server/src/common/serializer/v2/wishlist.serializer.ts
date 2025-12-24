import { IWishlist } from '@otl/server-nest/common/interfaces'
import { toJsonLectureDetail } from '@otl/server-nest/common/serializer/lecture.serializer'

import { EWishlist } from '@otl/prisma-client/entities'

export const toJsonWishlist = (wishlist: EWishlist.WithLectures): IWishlist.WithLectures => ({
  lectures: wishlist.timetable_wishlist_lectures.map((lecture) => toJsonLectureDetail(lecture.subject_lecture)),
})
