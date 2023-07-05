import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { review_review, session_userprofile, subject_department } from "@prisma/client";

@Injectable()
export class ReviewRepository{
  constructor(private readonly prisma: PrismaService){}

  async findReviewByUser(user: session_userprofile): Promise<review_review[]>{
    const reviews = await this.prisma.review_review.findMany({
      where: { writer_id: user.id },
    })
    return reviews;
  }

}