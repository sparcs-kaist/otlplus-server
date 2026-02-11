import { Injectable } from '@nestjs/common'

import { ELecture, EWishlist } from '../entities'
import { PrismaService } from '../prisma.service'

@Injectable()
export class WishlistRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateWishlist(userId: number) {
    return this.prisma.timetable_wishlist.upsert({
      where: { user_id: userId },
      create: { user_id: userId },
      update: {},
      include: EWishlist.WithLectures.include,
    })
  }

  async getOrCreateWishlistBySemester(
    userId: number,
    year: number,
    semester: number,
  ): Promise<EWishlist.WithLecturesBySemesterPayload> {
    return this.prisma.timetable_wishlist.upsert({
      where: { user_id: userId }, // user_id unique
      create: { user_id: userId },
      update: {},
      include: {
        timetable_wishlist_lectures: {
          where: {
            subject_lecture: { year, semester, deleted: false },
          },
          include: {
            subject_lecture: { include: ELecture.Details.include },
          },
        },
      },
    })
  }

  async addLecture(wishlistId: number, lectureId: number) {
    return this.prisma.timetable_wishlist_lectures.upsert({
      where: {
        wishlist_id_lecture_id: {
          lecture_id: lectureId,
          wishlist_id: wishlistId,
        },
      },
      create: { wishlist_id: wishlistId, lecture_id: lectureId },
      update: {},
    })
  }

  async removeLecture(wishlistId: number, lectureId: number) {
    return this.prisma.timetable_wishlist_lectures.delete({
      where: {
        wishlist_id_lecture_id: {
          lecture_id: lectureId,
          wishlist_id: wishlistId,
        },
      },
    })
  }

  async getLectureInWishlist(wishlistId: number, lectureId: number) {
    return this.prisma.timetable_wishlist_lectures.findUnique({
      where: {
        wishlist_id_lecture_id: {
          wishlist_id: wishlistId,
          lecture_id: lectureId,
        },
      },
    })
  }

  async getWishlistWithLectures(wishlistId: number): Promise<EWishlist.WithLectures | null> {
    return this.prisma.timetable_wishlist.findUnique({
      where: { id: wishlistId },
      include: EWishlist.WithLectures.include,
    })
  }
}
