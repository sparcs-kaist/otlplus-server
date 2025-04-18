import { Injectable } from '@nestjs/common'
import { IFeed } from '@otl/server-nest/common/interfaces'
import { session_userprofile, subject_department } from '@prisma/client'

import { getRandomChoice } from '@otl/common/utils/util'

import { EFeed } from '@otl/prisma-client/entities'
import {
  DepartmentRepository,
  FeedsRepository,
  ReviewsRepository,
  SemesterRepository,
  UserRepository,
} from '@otl/prisma-client/repositories'

@Injectable()
export class FeedsService {
  constructor(
    private readonly departmentRepository: DepartmentRepository,
    private readonly feedsRepository: FeedsRepository,
    private readonly reviewsRepository: ReviewsRepository,
    private readonly userRepository: UserRepository,
    private readonly semesterRepository: SemesterRepository,
  ) {}

  private filterFeeds(feeds: EFeed.Details[], feed: EFeed.Details | null) {
    if (feed && feed.visible) {
      feeds.push(feed)
    }
  }

  private async getFamousHumanityReview(date: Date): Promise<EFeed.Details> {
    let feed = await this.feedsRepository.getFamousHumanityReview(date)
    if (!feed) {
      const humanityBestReviews = await this.reviewsRepository.getRandomNHumanityBestReviews(3)

      feed = await this.feedsRepository.createFamousHumanityReview(date, humanityBestReviews)
    }

    return feed
  }

  private async getRankedReview(date: Date) {
    let feed = await this.feedsRepository.getRankedReview(date)

    if (!feed) {
      feed = await this.feedsRepository.createRankedReview(date)
    }
    return feed
  }

  private async getFamousMajorReviews(date: Date, departments: subject_department[]) {
    return await Promise.all(
      departments.map(async (department) => {
        let feed = await this.feedsRepository.getFamousMajorReview(date, department)

        if (!feed) {
          const majorBestReviews = await this.reviewsRepository.getRandomNMajorBestReviews(3, department)

          feed = await this.feedsRepository.createFamousMajorReview(date, department, majorBestReviews)
        }

        return feed
      }),
    )
  }

  private async getReviewWrite(date: Date, userId: number) {
    let feed = await this.feedsRepository.getReviewWrite(date, userId)

    if (!feed) {
      const notWritableSemester = await this.semesterRepository.getNotWritableSemester()
      const takenLecture = getRandomChoice(await this.userRepository.getTakenLectures(userId, notWritableSemester))
      if (!takenLecture) {
        return null
      }

      feed = await this.feedsRepository.createReviewWrite(date, userId, takenLecture.lecture_id)
    }

    return feed
  }

  private async getRelatedCourses(date: Date, userId: number) {
    let feed = await this.feedsRepository.getRelatedCourse(date, userId)

    if (!feed) {
      const takenLecture = getRandomChoice(await this.userRepository.getTakenLectures(userId))

      if (!takenLecture) {
        return null
      }

      feed = await this.feedsRepository.createRelatedCourse(date, userId, takenLecture.lecture.course_id)
    }

    return feed
  }

  public async getFeeds(query: IFeed.QueryDto, user: session_userprofile) {
    const { date: dateString } = query
    const date = new Date(dateString)
    const departments = await this.departmentRepository.getRelatedDepartments(user)
    const feeds: EFeed.Details[] = []

    const famousHumanityReview: EFeed.Details = await this.getFamousHumanityReview(date)
    this.filterFeeds(feeds, famousHumanityReview)

    /**
     * "RANKED_REVIEW" does not require RankedReview
     * Always shows TOP 3 liked reviews.
     */
    const rankedReview = await this.getRankedReview(date)
    const top3LikedReviews = await this.reviewsRepository.getTopLikedReviews(3)

    /**
     * RankedReview schema dose not have relation with review_review.
     * So, manually add reviews in app level.
     */
    const rankedReviewWithReviews: EFeed.RankedReviewDetails = {
      ...rankedReview,
      ...{ reviews: top3LikedReviews },
    }
    this.filterFeeds(feeds, rankedReviewWithReviews)

    const famousMajorReviews = await this.getFamousMajorReviews(date, departments)
    famousMajorReviews.forEach((feed) => {
      this.filterFeeds(feeds, feed)
    })

    const reviewWrite = await this.getReviewWrite(date, user.id)
    this.filterFeeds(feeds, reviewWrite)

    /**
     * @NOTE
     * RelatedCourse does not have Datas of posterior or prior courses.
     * Comment out below until having enough Datas.
     */
    // const relatedCourse = await this.getRelatedCourses(date, user.id);
    // this.filterFeeds(feeds, relatedCourse);

    const rateDaily = await this.feedsRepository.getOrCreateRate(date, user.id)
    this.filterFeeds(feeds, rateDaily)

    return feeds
  }
}
