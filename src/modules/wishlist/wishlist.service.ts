import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WishlistAddLectureDto } from 'src/common/interfaces/dto/wishlist/wishlist.request.dto';
import { LectureRepository } from 'src/prisma/repositories/lecture.repository';
import { WishlistRepository } from 'src/prisma/repositories/wishlist.repository';

@Injectable()
export class WishlistService {
  constructor(
    private readonly wishlistRepository: WishlistRepository,
    private readonly lectureRepository: LectureRepository,
  ) {}

  async addLecture(userId: number, body: WishlistAddLectureDto) {
    const wishlist = await this.wishlistRepository.getOrCreateWishlist(userId);

    if (
      await this.wishlistRepository.getLectureInWishlist(
        wishlist.id,
        body.lecture,
      )
    )
      throw new BadRequestException("Wrong field 'lecture' in request data");

    const lecture = await this.lectureRepository.getLectureById(body.lecture);
    if (!lecture)
      throw new NotFoundException(
        `Lecture with id ${body.lecture} does not exist`,
      );

    await this.wishlistRepository.addLecture(wishlist.id, lecture.id);
    const updatedWishlist = await this.wishlistRepository.getWishlistLectures(
      wishlist.id,
    );
    if (!updatedWishlist) throw new Error('Wishlist not found');
    return updatedWishlist;
  }
}
