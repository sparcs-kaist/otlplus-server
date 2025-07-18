import { Inject, Injectable } from '@nestjs/common'
import { Transactional } from '@nestjs-cls/transactional'
import { LECTURE_REPOSITORY, ServerConsumerLectureRepository } from '@otl/server-consumer/out/lecture.repository'
import { LectureBasic } from '@otl/server-nest/modules/lectures/domain/lecture'
import { review_review } from '@prisma/client'

import { reCalcScoreReturn } from '@otl/prisma-client'

@Injectable()
export class LectureService {
  constructor(
    @Inject(LECTURE_REPOSITORY)
    private readonly lectureRepository: ServerConsumerLectureRepository,
  ) {}

  @Transactional()
  public async updateClassTitle(lectureId: number): Promise<boolean> {
    const lectures = await this.lectureRepository.getRelatedLectureById(lectureId)
    const result = await this.addTitleFormat(lectures)
    if (!result) {
      throw new Error(`Failed to update lecture title for lectureId: ${lectureId}`)
    }
    return await this.addTitleFormatEn(lectures)
  }

  @Transactional()
  public async updateScore(lectureId: number): Promise<boolean> {
    const lecture = await this.lectureRepository.getLectureById(lectureId)
    await this.lectureRecalcScore(lecture)
    return true
  }

  private async lectureRecalcScore(lecture: LectureBasic) {
    const professors = await this.prisma.subject_professor.findMany({
      where: {
        subject_lecture_professors: {
          some: { lecture: { id: lecture.id } },
        },
      },
    })
    const professorsId = professors.map((result) => result.id)
    const reviews = await this.prisma.review_review.findMany({
      where: {
        lecture: {
          AND: [
            {
              course: {
                id: lecture.course_id,
              },
            },
            {
              subject_lecture_professors: {
                some: {
                  professor: {
                    id: { in: professorsId },
                  },
                },
              },
            },
          ],
        },
      },
    })
    const grades = await this.lectureCalcAverage(reviews)
    await this.prisma.subject_lecture.update({
      where: { id: lecture.id },
      data: {
        review_total_weight: grades.totalWeight,
        grade_sum: grades.sums.gradeSum,
        load_sum: grades.sums.loadSum,
        speech_sum: grades.sums.speechSum,
        grade: grades.avgs.grade,
        load: grades.avgs.load,
        speech: grades.avgs.speech,
      },
    })
  }

  private async lectureCalcAverage(reviews: review_review[]): Promise<reCalcScoreReturn> {
    const nonzeroReviews = reviews.filter((review) => review.grade !== 0 || review.load !== 0 || review.speech !== 0)
    const reducedNonzero = await Promise.all(
      nonzeroReviews.map(async (review) => {
        const weight = await this.lectureGetWeight(review)
        return {
          weight,
          grade: review.grade,
          speech: review.speech,
          load: review.load,
        }
      }),
    )
    const reviewNum = reviews.length
    const totalWeight = reducedNonzero.reduce((acc, r) => acc + r.weight, 0)
    const gradeSum = reducedNonzero.reduce((acc, r) => acc + r.weight * r.grade * 3, 0)
    const loadSum = reducedNonzero.reduce((acc, r) => acc + r.weight * r.load * 3, 0)
    const speechSum = reducedNonzero.reduce((acc, r) => acc + r.weight * r.speech * 3, 0)

    const grade = totalWeight !== 0 ? gradeSum / totalWeight : 0.0
    const load = totalWeight !== 0 ? loadSum / totalWeight : 0.0
    const speech = totalWeight !== 0 ? speechSum / totalWeight : 0.0

    return {
      reviewNum,
      totalWeight,
      sums: {
        gradeSum,
        loadSum,
        speechSum,
      },
      avgs: {
        grade,
        load,
        speech,
      },
    }
  }

  private async lectureGetWeight(review: review_review): Promise<number> {
    const baseYear = new Date().getFullYear()
    const lectureYear: number = (
      await this.prisma.subject_lecture.findUniqueOrThrow({
        where: { id: review.id },
        select: {
          year: true,
        },
      })
    ).year
    const yearDiff = baseYear > lectureYear ? baseYear - lectureYear : 0
    return (Math.sqrt(review.like) + 2) * 0.85 ** yearDiff
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
}
