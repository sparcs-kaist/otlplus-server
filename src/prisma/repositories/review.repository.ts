import { Injectable } from '@nestjs/common';
import { session_userprofile } from "@prisma/client";
import { PrismaService } from '../prisma.service';
import { ReviewDetails } from "../../common/schemaTypes/types";

@Injectable()
export class ReviewsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findReviewByUser(user: session_userprofile): Promise<ReviewDetails[]> {
    const reviews = await this.prisma.review_review.findMany({
      where: { writer_id: user.id },
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
    });
    return reviews;
  }

  public async getReviews(
    lecture_year: number,
    lecture_semester: number,
    order: string[],
    offset: number,
    limit: number,
  ): Promise<ReviewDetails[]> {
    let lectureFilter: object = {};
    const orderFilter: { [key: string]: string }[] = [];
    if (lecture_year) {
      lectureFilter = { ...lectureFilter, year: lecture_year };
    }
    if (lecture_semester) {
      lectureFilter = { ...lectureFilter, semester: lecture_semester };
    }
    order.forEach((orderList) => {
      const orderDict: { [key: string]: string } = {};
      let order = 'asc';
      const orderBy = orderList.split('-');
      if (orderBy[0] == '') {
        order = 'desc';
      }
      orderDict[orderBy[orderBy.length - 1]] = order;
      orderFilter.push(orderDict);
    });
    const reviews = await this.prisma.review_review.findMany({
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
    });

    return reviews;
  }

  async isLiked(reviewId: number, userId: number): Promise<boolean> {
    return !!(await this.prisma.review_reviewvote.findUnique({
      where: {
        review_id_userprofile_id: {
          review_id: reviewId,
          userprofile_id: userId,
        },
      },
    }));
  }
  public async getReviewsCount(
    lecture_year: number,
    lecture_semester: number,
  ): Promise<number> {
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

  async newReview(
    courseId: number,
    lectureId: number,
    content: string,
    grade: number,
    load: number,
    speech: number,
    writerId: number,
  ): Promise<ReviewDetails> {
    return await this.prisma.review_review.upsert({
      where: {
        writer_id_lecture_id: {writer_id:writerId, lecture_id:lectureId}
      },
      update: {},
      create: {
        course: { connect: { id: courseId } },
        lecture: { connect: { id: lectureId } },
        content: content,
        grade: grade,
        load: load,
        speech: speech,
        writer: { connect: { id: writerId } },
        writer_label: '무학과 넙죽이',
        written_datetime: new Date(),
        updated_datetime: new Date(),
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
    });
  }
}
