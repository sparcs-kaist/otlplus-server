import { Injectable } from '@nestjs/common'
import { ILecture, IReview } from '@otl/server-nest/common/interfaces'
import { toJsonLectureDetail } from '@otl/server-nest/common/serializer/lecture.serializer'
import { toJsonReview } from '@otl/server-nest/common/serializer/review.serializer'
import { session_userprofile } from '@prisma/client'

import {
  EReview, LectureRepository, PrismaService, ReviewsRepository,
} from '@otl/prisma-client'
import { ELecture } from '@otl/prisma-client/entities'

@Injectable()
export class LecturesService {
  constructor(
    private lectureRepository: LectureRepository,
    private reviewsRepository: ReviewsRepository,
    private prisma: PrismaService,
  ) {}

  public async getLectureByFilter(query: ILecture.QueryDto): Promise<ILecture.Detail[]> {
    const queryResult = await this.lectureRepository.filterByRequest(query)
    return queryResult.map((lecture) => toJsonLectureDetail(lecture))
  }

  public async getLectureById(id: number): Promise<ILecture.Detail> {
    const queryResult = await this.lectureRepository.getLectureDetailById(id)
    return toJsonLectureDetail(queryResult)
  }

  public async getLectureReviews(
    user: session_userprofile,
    lectureId: number,
    query: IReview.LectureReviewsQueryDto,
  ): Promise<(IReview.Basic & { userspecific_is_liked: boolean })[]> {
    const MAX_LIMIT = 100
    const DEFAULT_ORDER = ['-written_datetime', '-id']
    const reviews = await this.reviewsRepository.getReviewsOfLecture(
      lectureId,
      query.order ?? DEFAULT_ORDER,
      query.offset ?? 0,
      query.limit ?? MAX_LIMIT,
    )

    // TODO: Make this efficient. Get this info together in getReviewsOfLecture
    return await Promise.all(
      reviews.map(async (review) => {
        const result = toJsonReview(review)
        if (user) {
          const isLiked: boolean = await this.reviewsRepository.isLiked(review.id, user.id)
          return Object.assign(result, {
            userspecific_is_liked: isLiked,
          })
        }
        return Object.assign(result, {
          userspecific_is_liked: false,
        })
      }),
    )
  }

  public async getLectureRelatedReviews(
    user: session_userprofile,
    lectureId: number,
    query: IReview.LectureReviewsQueryDto,
  ): Promise<(IReview.Basic & { userspecific_is_liked: boolean })[]> {
    const DEFAULT_LIMIT = 100
    const DEFAULT_ORDER = ['-written_datetime', '-id']

    const lecture = await this.lectureRepository.getLectureDetailById(lectureId)
    const reviews: EReview.Details[] = await this.reviewsRepository.getRelatedReviewsOfLecture(
      query.order ?? DEFAULT_ORDER,
      query.offset ?? 0,
      query.limit ?? DEFAULT_LIMIT,
      lecture,
    )

    return await Promise.all(
      reviews.map(async (review) => {
        const result = toJsonReview(review)
        if (user) {
          const isLiked: boolean = await this.reviewsRepository.isLiked(review.id, user.id)
          return Object.assign(result, {
            userspecific_is_liked: isLiked,
          })
        }
        return Object.assign(result, {
          userspecific_is_liked: false,
        })
      }),
    )
  }

  public async getLecturesByIds(ids: number[]): Promise<ELecture.Details[]> {
    return await this.lectureRepository.getLectureByIds(ids)
  }

  async getLectureAutocomplete(dto: ILecture.AutocompleteQueryDto) {
    const candidate = await this.lectureRepository.getLectureAutocomplete(dto.year, dto.semester, dto.keyword)
    if (!candidate) return dto.keyword
    return this.findAutocompleteFromCandidate(candidate, dto.keyword)
  }

  private findAutocompleteFromCandidate(candidate: ELecture.Extended, keyword: string) {
    const keywordLower = keyword.toLowerCase()
    if (candidate.subject_department.name.startsWith(keyword)) return candidate.subject_department.name
    if (candidate.subject_department.name_en?.toLowerCase().startsWith(keywordLower)) return candidate.subject_department.name_en
    if (candidate.title.startsWith(keyword)) return candidate.title
    if (candidate.title_en.toLowerCase().startsWith(keywordLower)) return candidate.title_en
    for (const professor of candidate.subject_lecture_professors) {
      if (professor.professor.professor_name.startsWith(keyword)) return professor.professor.professor_name
      if (professor.professor.professor_name_en?.toLowerCase().startsWith(keywordLower)) return professor.professor.professor_name_en
    }
    return undefined
  }

  async getLectureDetailsForTimetable(
    lectureIds: number[],
    isEnglish: boolean,
  ): Promise<Map<number, { professorText: string, classroomShortStr: string }>> {
    const lectureDetails = await this.lectureRepository.getLectureDetailsForTimetable(lectureIds)

    const lectureDetailsMap = new Map<number, { professorText: string, classroomShortStr: string }>()

    lectureDetails.forEach((lecture) => {
      const professorShortStr = lecture.subject_lecture_professors.map((lp) => (isEnglish ? lp.professor.professor_name_en : lp.professor.professor_name))
      const professorText = professorShortStr.length <= 2
        ? professorShortStr.join(', ')
        : isEnglish
          ? `${professorShortStr[0]} and ${professorShortStr.length - 1} others`
          : `${professorShortStr[0]} 외 ${professorShortStr.length - 1} 명`

      const classtime = lecture.subject_classtime[0]
      let classroomShortStr = ''

      if (classtime) {
        const { building_full_name, building_full_name_en, room_name } = classtime

        if (!building_full_name) {
          classroomShortStr = isEnglish ? 'Unknown' : '정보 없음'
        }
        else {
          if (building_full_name.startsWith('(')) {
            const buildingCode = building_full_name.substring(1, building_full_name.indexOf(')'))
            classroomShortStr = `(${buildingCode}) ${room_name || ''}`
          }
          else {
            classroomShortStr = `${building_full_name} ${room_name || ''}`
          }

          if (building_full_name_en && building_full_name_en.startsWith('(')) {
            const buildingCodeEn = building_full_name_en.substring(1, building_full_name_en.indexOf(')'))
            classroomShortStr = isEnglish ? `(${buildingCodeEn}) ${room_name || ''}` : classroomShortStr
          }
          else {
            classroomShortStr = isEnglish ? `${building_full_name_en} ${room_name || ''}` : classroomShortStr
          }
        }
      }
      else {
        classroomShortStr = isEnglish ? 'Unknown' : '정보 없음'
      }

      lectureDetailsMap.set(lecture.id, {
        professorText,
        classroomShortStr,
      })
    })

    return lectureDetailsMap
  }
}
