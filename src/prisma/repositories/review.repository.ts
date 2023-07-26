import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { review_review, session_userprofile, subject_department } from "@prisma/client";
interface lectureFilter{
  [key:any]:number;
}

@Injectable()
export class ReviewsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findReviewByUser(user: session_userprofile): Promise<review_review[]>{
    const reviews = await this.prisma.review_review.findMany({
      where: { writer_id: user.id },
    })
    return reviews;
  }

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
