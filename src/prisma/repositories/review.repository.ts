import { applyOffset } from 'src/common/utils/search.utils';
import { Injectable } from '@nestjs/common';
import { applyOrder } from 'src/common/utils/search.utils';
import { review_review } from 'src/prisma/generated/prisma-class/review_review';
import { session_userprofile } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ReviewsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findReviewByUser(user: session_userprofile): Promise<review_review[]>{
    const reviews = await this.prisma.review_review.findMany({
      where: { writer_id: user.id },
      include:{
        course: {
          include:{
            lecture: true,
          }
        },
        lecture: true,
      }
    })
    return reviews as review_review[];
  }
  public async getReviews(
    lecture_year: number,
    lecture_semester: number,
    order: string[],
    offset: number,
    limit: number
  ): Promise<review_review[]> {
    let lectureFilter: object = {};
    const orderFilter: { [key: string]: string }[] = [];
    if (lecture_year) {
      lectureFilter = { ...lectureFilter, year: lecture_year };
    }
    if (lecture_semester) {
      lectureFilter = { ...lectureFilter, semester: lecture_semester };
    }
    order.forEach((orderList) => {
      const orderDict: {[key:string]:string} = {};
      let order = 'asc';
      const orderBy = orderList.split('-');
      if (orderBy[0] == '') {
        order = 'desc';
      }
      orderDict[orderBy[orderBy.length - 1]] = order;
      orderFilter.push(orderDict);
    });
    const reviews = (await this.prisma.review_review.findMany({
      where: {
        lecture: lectureFilter,
      },
      include: {
        course: {
          include: {
            subject_department: true,
            subject_course_professors: { include: { professor: true } },
            lecture: true,
            subject_courseuser: true,
          },
        },
        lecture: {
          include: {
            subject_department: true,
            subject_lecture_professors: { include: { professor: true } },
            subject_classtime: true,
            subject_examtime: true,
          },
        },
      },
      skip: offset,
      take: limit,
      orderBy: orderFilter,
      distinct: [
        'id',
        'course_id',
        'lecture_id',
        'content',
        'grade',
        'load',
        'speech',
        'writer_id',
        'writer_label',
        'updated_datetime',
        'like',
        'is_deleted',
        'written_datetime',
      ],
    })) as review_review[];

    return reviews;
  }

  async isLiked(reviewId: number, userId: number): Promise<boolean> {
    return !!(await this.prisma.review_reviewvote.findUnique({
      where: {
        review_id_userprofile_id:{
          review_id: reviewId,
          userprofile_id: userId
        }
      },
    }));
  }
  public async getReviewsCount(lecture_year:number, lecture_semester:number):Promise<number> {
    let lecture_filter: object = {};
    if (lecture_year) {
      lecture_filter = { ...lecture_filter, year: lecture_year };
    }
    if (lecture_semester) {
      lecture_filter = { ...lecture_filter, semester: lecture_semester };
    }
    const reviewsCount = await this.prisma.review_review.count({
      where: {
        lecture: lecture_filter,
      },
      distinct: [
        'id',
        'course_id',
        'lecture_id',
        'content',
        'grade',
        'load', 
        'speech',
        'writer_id',
        'writer_label',
        'updated_datetime',
        'like',
        'is_deleted',
        'written_datetime',
      ],
    }); 
    return reviewsCount;
  }
}
