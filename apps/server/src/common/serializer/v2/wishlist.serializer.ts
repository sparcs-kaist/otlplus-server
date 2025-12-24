import { IWishlistV2 } from '@otl/server-nest/common/interfaces/v2'
import { toJsonLectureDetail } from '@otl/server-nest/common/serializer/lecture.serializer'

import { EWishlistV2 } from '@otl/prisma-client/entities'

export const toJsonWishlist = (wishlist: EWishlistV2.WithLectures): IWishlistV2.WithLectures => ({
  lectures: wishlist.timetable_wishlist_lectures.map((lecture) => toJsonLectureDetail(lecture.subject_lecture)),
})
