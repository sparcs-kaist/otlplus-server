import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { IWishlist } from '@otl/api-interface/src/interfaces/IWishlist';
import { LectureRepository } from '@src/prisma/repositories/lecture.repository';
import { WishlistRepository } from '@src/prisma/repositories/wishlist.repository';
import { Transactional } from '@nestjs-cls/transactional';

@Injectable()
export class WishlistService {
  constructor(
    private readonly wishlistRepository: WishlistRepository,
    private readonly lectureRepository: LectureRepository,
  ) {}

  async getWishlistWithLectures(userId: number) {
    return await this.wishlistRepository.getOrCreateWishlist(userId);
  }

  @Transactional()
  async addLecture(userId: number, body: IWishlist.AddLectureDto) {
    const wishlist = await this.wishlistRepository.getOrCreateWishlist(userId);

    if (await this.wishlistRepository.getLectureInWishlist(wishlist.id, body.lecture))
      throw new BadRequestException("Wrong field 'lecture' in request data");

    const lecture = await this.lectureRepository.getLectureById(body.lecture);
    if (!lecture) throw new NotFoundException(`Lecture with id ${body.lecture} does not exist`);

    await this.wishlistRepository.addLecture(wishlist.id, lecture.id);
    const updatedWishlist = await this.wishlistRepository.getWishlistWithLectures(wishlist.id);
    if (!updatedWishlist) throw new Error('Wishlist not found');
    return updatedWishlist;
  }

  @Transactional()
  async removeLecture(userId: number, body: IWishlist.RemoveLectureDto) {
    const wishlist = await this.wishlistRepository.getOrCreateWishlist(userId);

    if (!(await this.wishlistRepository.getLectureInWishlist(wishlist.id, body.lecture)))
      throw new BadRequestException("Wrong field 'lecture' in request data");

    await this.wishlistRepository.removeLecture(wishlist.id, body.lecture);
    const updatedWishlist = await this.wishlistRepository.getWishlistWithLectures(wishlist.id);
    if (!updatedWishlist) throw new Error('Wishlist not found');
    return updatedWishlist;
  }
}
