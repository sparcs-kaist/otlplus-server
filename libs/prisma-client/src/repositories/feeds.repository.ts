import { Injectable } from '@nestjs/common'
import {
  main_ratedailyuserfeed,
  review_humanitybestreview,
  review_majorbestreview,
  subject_department,
} from '@prisma/client'

import { PrismaReadService } from '@otl/prisma-client/prisma.read.service'
import { PrismaService } from '@otl/prisma-client/prisma.service'
import { FeedRateMinDays, FeedVisibleRate } from '@otl/prisma-client/types'

import { EFeed } from '../entities/EFeed'

@Injectable()
export class FeedsRepository {
  constructor(private readonly prisma: PrismaService, private readonly prismaRead: PrismaReadService) {}

  public async getFamousHumanityReview(date: Date): Promise<EFeed.Details | null> {
    return await this.prismaRead.main_famoushumanityreviewdailyfeed.findFirst({
      where: {
        date,
      },
      include: EFeed.FamousHumanityReviewDetails.include,
    })
  }

  public async createFamousHumanityReview(date: Date, humanityBestReviews: review_humanitybestreview[]) {
    return await this.prisma.main_famoushumanityreviewdailyfeed.create({
      include: EFeed.FamousHumanityReviewDetails.include,
      data: {
        date,
        priority: Math.random(),
        main_famoushumanityreviewdailyfeed_reviews: {
          createMany: {
            data: humanityBestReviews,
          },
        },
        visible: Math.random() < FeedVisibleRate.FamousHumanityReview,
      },
    })
  }

  public async getRankedReview(date: Date) {
    return await this.prismaRead.main_rankedreviewdailyfeed.findFirst({
      where: {
        date,
      },
    })
  }

  public async createRankedReview(date: Date) {
    return await this.prisma.main_rankedreviewdailyfeed.create({
      data: {
        date,
        priority: Math.random(),
        visible: Math.random() < FeedVisibleRate.RankedReview,
      },
    })
  }

  public async getFamousMajorReview(date: Date, department: subject_department) {
    return await this.prismaRead.main_famousmajorreviewdailyfeed.findFirst({
      include: EFeed.FamousMajorReviewDetails.include,
      where: {
        date,
        subject_department: department,
      },
    })
  }

  public async createFamousMajorReview(
    date: Date,
    department: subject_department,
    majorBestReviews: review_majorbestreview[],
    departmentNum: number = 1,
  ) {
    return await this.prisma.main_famousmajorreviewdailyfeed.create({
      include: EFeed.FamousMajorReviewDetails.include,
      data: {
        date,
        priority: Math.random(),
        visible: Math.random() < FeedVisibleRate.FamousMajorReview / departmentNum ** 0.7,
        department_id: department.id,
        main_famousmajorreviewdailyfeed_reviews: {
          createMany: { data: majorBestReviews },
        },
      },
    })
  }

  public async getReviewWrite(date: Date, userId: number) {
    return await this.prismaRead.main_reviewwritedailyuserfeed.findFirst({
      include: EFeed.ReviewWriteDetails.include,
      where: {
        date,
        user_id: userId,
      },
    })
  }

  public async createReviewWrite(date: Date, userId: number, takenLectureId: number) {
    return await this.prisma.main_reviewwritedailyuserfeed.create({
      include: EFeed.ReviewWriteDetails.include,
      data: {
        date,
        priority: Math.random(),
        visible: Math.random() < FeedVisibleRate.ReviewWrite,
        user_id: userId,
        lecture_id: takenLectureId,
      },
    })
  }

  public async getRelatedCourse(date: Date, userId: number) {
    return await this.prismaRead.main_relatedcoursedailyuserfeed.findFirst({
      include: EFeed.RelatedCourseDetails.include,
      where: {
        date,
        user_id: userId,
      },
    })
  }

  public async createRelatedCourse(date: Date, userId: number, takenLectureCourseId: number) {
    return await this.prisma.main_relatedcoursedailyuserfeed.create({
      include: EFeed.RelatedCourseDetails.include,
      data: {
        date,
        priority: Math.random(),
        visible: Math.random() < FeedVisibleRate.RelatedCourse,
        course_id: takenLectureCourseId,
        user_id: userId,
      },
    })
  }

  public async getOrCreateRate(date: Date, userId: number): Promise<main_ratedailyuserfeed | null> {
    let feed = await this.prisma.main_ratedailyuserfeed.findFirst({
      where: {
        date,
        user_id: userId,
      },
    })

    if (!feed) {
      if (
        await this.prisma.support_rate.findFirst({
          where: {
            user_id: userId,
            year: date.getFullYear(),
          },
        })
      ) {
        return null
      }

      const beforeDate = new Date(date)
      beforeDate.setDate(date.getDate() - FeedRateMinDays)
      const afterDate = new Date(date)
      afterDate.setDate(date.getDate() + FeedRateMinDays)
      const weekFeeds = await this.prisma.main_ratedailyuserfeed.findMany({
        where: {
          date: {
            gt: beforeDate,
            lt: afterDate,
          },
          visible: true,
          user_id: userId,
        },
      })
      if (weekFeeds.length > 0) {
        return null
      }

      feed = await this.prisma.main_ratedailyuserfeed.create({
        data: {
          date,
          priority: Math.random(),
          visible: Math.random() < FeedVisibleRate.Rate,
          user_id: userId,
        },
      })
    }

    return feed
  }
}
