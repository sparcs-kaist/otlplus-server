import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { EWishlist } from '@otl/api-interface/src/entities/EWishlist';

@Injectable()
export class WishlistRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateWishlist(userId: number) {
    return await this.prisma.timetable_wishlist.upsert({
      where: { user_id: userId },
      create: { user_id: userId },
      update: {},
      include: EWishlist.WithLectures.include,
    });
  }

  async addLecture(wishlistId: number, lectureId: number) {
    return await this.prisma.timetable_wishlist_lectures.upsert({
      where: {
        wishlist_id_lecture_id: {
          lecture_id: lectureId,
          wishlist_id: wishlistId,
        },
      },
      create: { wishlist_id: wishlistId, lecture_id: lectureId },
      update: {},
    });
  }

  async removeLecture(wishlistId: number, lectureId: number) {
    return await this.prisma.timetable_wishlist_lectures.delete({
      where: {
        wishlist_id_lecture_id: {
          lecture_id: lectureId,
          wishlist_id: wishlistId,
        },
      },
    });
  }

  async getLectureInWishlist(wishlistId: number, lectureId: number) {
    return await this.prisma.timetable_wishlist_lectures.findUnique({
      where: {
        wishlist_id_lecture_id: {
          wishlist_id: wishlistId,
          lecture_id: lectureId,
        },
      },
    });
  }

  async getWishlistWithLectures(wishlistId: number): Promise<EWishlist.WithLectures | null> {
    return await this.prisma.timetable_wishlist.findUnique({
      where: { id: wishlistId },
      include: EWishlist.WithLectures.include,
    });
  }
}
