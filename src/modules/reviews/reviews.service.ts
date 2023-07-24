import { Injectable } from '@nestjs/common';
import { review_review } from '@prisma/client';
import { ReviewsRepository } from 'src/prisma/repositories/review.repository';

@Injectable()
export class ReviewsService {

  constructor(private readonly reviewsRepository:ReviewsRepository) {}
    async getReviews(lecture_year: number, lecture_semester:number): Promise<review_review[]>{
        return await this.reviewsRepository.getReviews(lecture_year, lecture_semester);
    }
}
