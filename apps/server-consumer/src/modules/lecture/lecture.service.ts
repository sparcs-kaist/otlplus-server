import { Inject, Injectable } from '@nestjs/common'
import { REDLOCK } from '@otl/redis/redlock.provider'
import { LECTURE_REPOSITORY, ServerConsumerLectureRepository } from '@otl/server-consumer/out/lecture.repository'
import { PROFESSOR_REPOSITORY, ServerConsumerProfessorRepository } from '@otl/server-consumer/out/professor.repository'
import { REVIEW_REPOSITORY, ServerConsumerReviewRepository } from '@otl/server-consumer/out/review.repository'
import { LectureBasic, LectureScore } from '@otl/server-nest/modules/lectures/domain/lecture'
import { ReviewWithLecture } from '@otl/server-nest/modules/reviews/domain/review'
import Redlock from 'redlock'

import logger from '@otl/common/logger/logger'

@Injectable()
export class LectureService {
  constructor(
    @Inject(LECTURE_REPOSITORY)
    private readonly lectureRepository: ServerConsumerLectureRepository,
    @Inject(PROFESSOR_REPOSITORY)
    private readonly professorRepository: ServerConsumerProfessorRepository,
    @Inject(REVIEW_REPOSITORY)
    private readonly reviewRepository: ServerConsumerReviewRepository,
    @Inject(REDLOCK)
    private readonly redlock: Redlock,
  ) {}

  public async updateClassTitle(lectureId: number, courseId: number): Promise<boolean> {
    const resourceKey = `locks:course:${courseId}:update-title`
    const lockDuration = 10000
    let lock
    try {
      lock = await this.redlock.acquire([resourceKey], lockDuration)
      console.log(`Acquired lock for resource: ${resourceKey}`)
      console.log(lectureId, courseId)
      const lectures = await this.lectureRepository.getRelatedLectureById(lectureId, courseId)
      const result = await this.addTitleFormat(lectures)
      if (!result) {
        throw new Error(`Failed to update lecture title for lectureId: ${lectureId}`)
      }
      return await this.addTitleFormatEn(lectures)
    }
    catch (err: any) {
      if (err.name === 'LockError') {
        logger.warn(`Could not acquire lock for courseId: ${courseId}. Skipping update.`)
        logger.error(err)
        return false
      }
      logger.error(err)
      throw err
    }
    finally {
      if (lock) {
        await lock.release()
      }
    }
  }

  public async updateScore(lectureId: number) {
    const lecture = await this.lectureRepository.getLectureById(lectureId)
    return await this.lectureRecalcScore(lecture)
  }

  private async lectureRecalcScore(lecture: LectureBasic) {
    const professors = await this.professorRepository.findProfessorsByLectureId(lecture.id)
    const professorsId = professors.map((professor) => professor.id)
    const relatedReviews = await this.reviewRepository.getRelatedReviewsByLectureId(lecture, professorsId)

    const grades: LectureScore & { reviewNum: number } = await this.lectureCalcAverage(relatedReviews)
    return await this.lectureRepository.updateLectureScore(lecture.id, grades)
  }

  public async lectureCalcAverage(reviews: ReviewWithLecture[]): Promise<LectureScore & { reviewNum: number }> {
    const nonzeroReviews = reviews.filter((review) => review.grade !== 0 || review.load !== 0 || review.speech !== 0)
    const reducedNonzero = nonzeroReviews.map((review) => {
      const weight = this.lectureGetWeight(review)
      return {
        weight,
        grade: review.grade,
        speech: review.speech,
        load: review.load,
      }
    })
    const reviewNum = reviews.length
    const reviewTotalWeight = reducedNonzero.reduce((acc, r) => acc + r.weight, 0)
    const gradeSum = reducedNonzero.reduce((acc, r) => acc + r.weight * r.grade * 3, 0)
    const loadSum = reducedNonzero.reduce((acc, r) => acc + r.weight * r.load * 3, 0)
    const speechSum = reducedNonzero.reduce((acc, r) => acc + r.weight * r.speech * 3, 0)

    const grade = reviewTotalWeight !== 0 ? gradeSum / reviewTotalWeight : 0.0
    const load = reviewTotalWeight !== 0 ? loadSum / reviewTotalWeight : 0.0
    const speech = reviewTotalWeight !== 0 ? speechSum / reviewTotalWeight : 0.0

    return {
      reviewNum,
      reviewTotalWeight,
      gradeSum,
      loadSum,
      speechSum,
      grade,
      load,
      speech,
    }
  }

  public lectureGetWeight(review: ReviewWithLecture): number {
    const baseYear = new Date().getFullYear()
    const lectureYear: number = review.lecture.semester.year
    const yearDiff = baseYear > lectureYear ? baseYear - lectureYear : 0
    return (Math.sqrt(review.likeCnt) + 2) * 0.85 ** yearDiff
  }

  private async addTitleFormat(lectures: LectureBasic[]) {
    if (lectures.length === 1) {
      const { title } = lectures[0]
      const commonTitle = title.endsWith('>') ? title.substring(0, title.indexOf('<')) : title
      return await this.update(lectures, commonTitle, false)
    }
    const commonTitle = this.lcsFront(lectures.map((lecture) => lecture.title))
    return await this.update(lectures, commonTitle, false)
  }

  private async addTitleFormatEn(lectures: LectureBasic[]) {
    if (lectures.length === 1) {
      const title = lectures[0].titleEn
      const commonTitle = title.endsWith('>') ? title.substring(0, title.indexOf('<')) : title
      return await this.update(lectures, commonTitle, true)
    }
    const commonTitle = this.lcsFront(lectures.map((lecture) => lecture.titleEn))
    return await this.update(lectures, commonTitle, true)
  }

  private async update(lectures: LectureBasic[], commonTitle: string, isEnglish: boolean) {
    return this.lectureRepository.updateLectureTitle(lectures, commonTitle, isEnglish)
  }

  private lcsFront(lectureTitles: string[]): string {
    if (lectureTitles.length === 0) return ''

    const sorted = [...lectureTitles].sort()
    const first = sorted[0]
    const last = sorted[sorted.length - 1]
    const minLength = Math.min(first.length, last.length)

    let i = 0
    while (i < minLength && first[i] === last[i]) {
      i += 1
    }

    let result = first.substring(0, i)
    result = result.replace(/[<([{]+$/, '')
    return result
  }

  async updateNumPeople(lectureId: number) {
    const count = await this.lectureRepository.countNumPeople(lectureId)
    if (count === undefined) {
      throw new Error(`Failed to update num_people for lectureId: ${lectureId}`)
    }
    return this.lectureRepository.updateNumPeople(lectureId, count)
  }
}
