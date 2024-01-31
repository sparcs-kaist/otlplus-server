import { Injectable } from '@nestjs/common';
import {
  WishlistWithLectures,
  wishlistLectures,
} from 'src/common/schemaTypes/types';
import { PrismaService } from '../prisma.service';

@Injectable()
export class WishlistRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateWishlist(userId: number) {
    return await this.prisma.timetable_wishlist.upsert({
      where: { user_id: userId },
      create: { user_id: userId },
      update: {},
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

  async getWishlistLectures(wishlistId: number) {
    return (await this.prisma.timetable_wishlist.findUnique({
      where: { id: wishlistId },
      include: wishlistLectures.include,
    })) as WishlistWithLectures;
  }
}
