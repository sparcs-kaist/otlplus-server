import { Injectable } from '@nestjs/common';
import { review_review } from '@prisma/client';
import { PrismaService } from '../prisma.service';
interface lectureFilter{
  [key:any]:number;
}
@Injectable()
export class ReviewsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getReviews(lecture_year: number, lecture_semester: number):Promise<review_review[]> {
    let lecture_filter:object = {};
    if(lecture_year){
      lecture_filter={...lecture_filter,year: lecture_year};
    }
    if(lecture_semester){
      lecture_filter = { ...lecture_filter, semester: lecture_semester };
    }
    //todo lecture와 review 연결.
    const reviews = await this.prisma.review_review.findMany({
      where: {
        lecture: lecture_filter,
      },
      distict: true,
    });
    return reviews;
  }
}
