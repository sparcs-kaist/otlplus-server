import { Injectable } from '@nestjs/common'
import { ServerConsumerReviewRepository } from '@otl/server-consumer/out/review.repository'
import { LectureBasic } from '@otl/server-nest/modules/lectures/domain/lecture'
import { ReviewBasic, ReviewWithLecture } from '@otl/server-nest/modules/reviews/domain/review'
import {
  review_humanitybestreview,
  review_majorbestreview,
  session_userprofile,
  subject_department,
} from '@prisma/client'

import { mapReview, mapReviewWithLecture } from '@otl/prisma-client/common/mapper/review'
import { PrismaReadService } from '@otl/prisma-client/prisma.read.service'
import { PrismaService } from '@otl/prisma-client/prisma.service'

import { orderFilter } from '../common/util'
import { ELecture } from '../entities/ELecture'
import { EReview } from '../entities/EReview'

@Injectable()
export class ReviewsRepository implements ServerConsumerReviewRepository {
  constructor(private readonly prisma: PrismaService, private readonly prismaRead: PrismaReadService) {}

  async findReviewByUser(user: session_userprofile): Promise<EReview.Details[]> {
    const reviews = await this.prisma.review_review.findMany({
      where: { writer_id: user.id },
      include: {
        course: {
          include: {
            subject_department: true,
            subject_course_professors: { include: { professor: true } },
            lecture: true,
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
        review_reviewvote: true,
      },
    })
    return reviews
  }

  async getReviewById(reviewId: number): Promise<EReview.Details | null> {
    return await this.prisma.review_review.findUnique({
      where: { id: reviewId },
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
        review_reviewvote: true,
      },
    })
  }

  async getReviewsByIds(reviewIds: number[]) {
    return this.prismaRead.review_review.findMany({
      where: {
        id: {
          in: reviewIds,
        },
      },
      include: EReview.Details.include,
    })
  }

  public async getReviews(
    order: string[],
    offset: number,
    limit: number,
    lectureYear?: number,
    lectureSemester?: number,
  ): Promise<EReview.Details[]> {
    let lectureFilter: object = {}
    const orderFilters: { [key: string]: string }[] = []
    if (lectureYear) {
      lectureFilter = { ...lectureFilter, year: lectureYear }
    }
    if (lectureSemester) {
      lectureFilter = { ...lectureFilter, semester: lectureSemester }
    }
    order.forEach((orderList) => {
      const orderDict: { [key: string]: string } = {}
      let sortOrder = 'asc'
      const orderBy = orderList.split('-')
      if (orderBy[0] === '') {
        sortOrder = 'desc'
      }
      orderDict[orderBy[orderBy.length - 1]] = sortOrder
      orderFilters.push(orderDict)
    })
    return this.prismaRead.review_review.findMany({
      where: {
        lecture: lectureFilter,
      },
      include: EReview.Details.include,
      orderBy: orderFilters,
      skip: offset,
      take: limit,
    })
  }

  async getReviewsOfLecture(id: number, order: string[], offset: number, limit: number): Promise<EReview.Details[]> {
    return this.prismaRead.review_review.findMany({
      where: { lecture_id: id },
      include: EReview.Details.include,
      orderBy: orderFilter(order),
      skip: offset,
      take: limit,
    })
  }

  public async getRelatedReviewsOfLecture(
    order: string[],
    offset: number,
    limit: number,
    lecture: ELecture.Details,
  ): Promise<EReview.Details[]> {
    return await this.prismaRead.review_review.findMany({
      ...EReview.Details,
      where: {
        lecture: {
          course_id: lecture.course_id,
          subject_lecture_professors: {
            some: {
              professor_id: {
                in: lecture.subject_lecture_professors.map((professor) => professor.professor_id),
              },
            },
          },
        },
      },
      skip: offset,
      take: limit,
      orderBy: orderFilter(order),
    })
  }

  public async getReviewsByCourseAndProfessor(
    order: string[],
    offset: number,
    limit: number,
    courseId: number,
    professorId: number,
  ): Promise<EReview.Details[]> {
    return await this.prismaRead.review_review.findMany({
      where: {
        lecture: {
          course_id: courseId,
          subject_lecture_professors: {
            some: {
              professor_id: professorId,
            },
          },
        },
      },
      include: EReview.Details.include,
      skip: offset,
      take: limit,
      orderBy: orderFilter(order),
    })
  }

  async isLiked(reviewId: number, userId: number): Promise<boolean> {
    return !!(await this.prisma.review_reviewvote.findUnique({
      where: {
        review_id_userprofile_id: {
          review_id: reviewId,
          userprofile_id: userId,
        },
      },
    }))
  }

  public async getLikedReviews(
    userId: number,
    order: string[],
    offset: number,
    limit: number,
  ): Promise<EReview.Details[]> {
    const likedReviews = await this.prisma.review_review.findMany({
      where: {
        review_reviewvote: {
          some: {
            userprofile_id: userId,
          },
        },
      },
      include: EReview.Details.include,
      take: limit,
      skip: offset,
      orderBy: orderFilter(order),
    })

    // const likedReviews = this.getReviewsByIds(likedReviewIds);
    return likedReviews
  }

  public async getReviewsCount(lectureYear?: number, lectureSemester?: number): Promise<number> {
    let lectureFilter: object = {}
    if (lectureYear) {
      lectureFilter = { ...lectureFilter, year: lectureYear }
    }
    if (lectureSemester) {
      lectureFilter = { ...lectureFilter, semester: lectureSemester }
    }
    const reviewsCount = await this.prismaRead.review_review.count({
      where: {
        lecture: lectureFilter,
      },
    })
    return reviewsCount
  }

  async upsertReview(
    courseId: number,
    lectureId: number,
    content: string,
    grade: number,
    load: number,
    speech: number,
    writerId: number,
  ): Promise<EReview.Details> {
    return await this.prisma.review_review.upsert({
      where: {
        writer_id_lecture_id: { writer_id: writerId, lecture_id: lectureId },
      },
      update: {},
      create: {
        course: { connect: { id: courseId } },
        lecture: { connect: { id: lectureId } },
        content,
        grade,
        load,
        speech,
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
        review_reviewvote: true,
      },
    })
  }

  async updateReview(
    reviewId: number,
    content?: string,
    grade?: number,
    load?: number,
    speech?: number,
  ): Promise<EReview.Details> {
    return await this.prisma.review_review.update({
      where: {
        id: reviewId,
      },
      data: {
        content,
        grade,
        load,
        speech,
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
        review_reviewvote: true,
      },
    })
  }

  public async getTopLikedReviews(n: number): Promise<EReview.Details[]> {
    return await this.prisma.review_review.findMany({
      include: EReview.Details.include,
      orderBy: {
        like: 'desc',
      },
      take: n,
    })
  }

  public async getRandomNHumanityBestReviews(n: number): Promise<review_humanitybestreview[]> {
    // Prisma does not support RAND() in ORDER BY.
    return await this.prisma.$queryRaw`
        SELECT *
        FROM review_humanitybestreview
        ORDER BY RAND()
            LIMIT ${n}`
  }

  public async getRandomNMajorBestReviews(
    n: number,
    department: subject_department,
  ): Promise<review_majorbestreview[]> {
    // Prisma does not support RAND() in ORDER BY.
    return await this.prisma.$queryRaw`
        SELECT mbr.*
        FROM review_majorbestreview mbr
                 INNER JOIN review_review r ON r.id = mbr.review_id
                 INNER JOIN subject_lecture l ON l.id = r.lecture_id
        WHERE l.department_id = ${department.id}
        ORDER BY RAND()
            LIMIT ${n}`
  }

  async upsertReviewVote(reviewId: number, userId: number): Promise<EReview.EReviewVote.Basic> {
    return await this.prisma.review_reviewvote.upsert({
      where: {
        review_id_userprofile_id: {
          review_id: reviewId,
          userprofile_id: userId,
        },
      },
      update: {},
      create: {
        review: { connect: { id: reviewId } },
        userprofile: { connect: { id: userId } },
      },
    })
  }

  async deleteReviewVote(reviewId: number, id: number) {
    return this.prisma.review_reviewvote.delete({
      where: {
        review_id_userprofile_id: {
          review_id: reviewId,
          userprofile_id: id,
        },
      },
    })
  }

  async getRelatedReviewsByLectureId(lecture: LectureBasic, professorsId: number[]): Promise<ReviewWithLecture[]> {
    if (lecture.courseId == null) {
      return (
        await this.prismaRead.review_review.findMany({
          where: {
            lecture: {
              id: lecture.id,
            },
          },
          include: EReview.WithLectures.include,
        })
      ).map((review) => mapReviewWithLecture(review))
    }

    const lectureProfessors = await this.prismaRead.subject_lecture_professors.findMany({
      where: {
        lecture: {
          course: {
            id: lecture.courseId,
          },
        },
        professor_id: {
          in: professorsId,
        },
      },
      select: { id: true, professor_id: true, lecture_id: true },
    })
    const lectureIds = [...new Set(lectureProfessors.map((lp) => lp.lecture_id))]
    const reviews = await this.prismaRead.review_review.findMany({
      where: {
        lecture: {
          id: { in: lectureIds },
        },
      },
      include: EReview.WithLectures.include,
    })
    return reviews.map((review) => mapReviewWithLecture(review))
  }

  async getRelatedReviewsByCourseId(courseId: number): Promise<ReviewWithLecture[]> {
    const reviews = await this.prismaRead.review_review.findMany({
      where: {
        lecture: {
          course: {
            id: courseId,
          },
        },
      },
      include: EReview.WithLectures.include,
    })
    return reviews.map((review) => mapReviewWithLecture(review))
  }

  getRelatedReviewsByProfessorId(professorId: number): Promise<ReviewWithLecture[]> {
    return this.prismaRead.review_review
      .findMany({
        where: {
          lecture: {
            subject_lecture_professors: {
              some: {
                professor_id: professorId,
              },
            },
          },
        },
        include: EReview.WithLectures.include,
      })
      .then((reviews) => reviews.map((review) => mapReviewWithLecture(review)))
  }

  async getReviewLikeCount(reviewId: number): Promise<number> {
    return await this.prismaRead.review_reviewvote.count({
      where: { review_id: reviewId },
    })
  }

  async updateReviewLikeCount(reviewId: number, likeCount: number): Promise<ReviewBasic> {
    return mapReview(
      await this.prisma.review_review.update({
        where: { id: reviewId },
        data: {
          like: likeCount,
        },
      }),
    )
  }
}
