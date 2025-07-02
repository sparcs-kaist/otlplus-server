import { Injectable, NotFoundException } from '@nestjs/common'
import { Transactional } from '@nestjs-cls/transactional'
import { ICourse, IReview } from '@otl/server-nest/common/interfaces'
import { addIsRead, toJsonCourseDetail } from '@otl/server-nest/common/serializer/course.serializer'
import { toJsonLectureDetail } from '@otl/server-nest/common/serializer/lecture.serializer'
import { toJsonReview } from '@otl/server-nest/common/serializer/review.serializer'
import { getRepresentativeLecture } from '@otl/server-nest/common/utils/lecture.utils'
import { session_userprofile } from '@prisma/client'

import { ECourse } from '@otl/prisma-client/entities'
import { CourseRepository } from '@otl/prisma-client/repositories'
import ECourseUser = ECourse.ECourseUser

@Injectable()
export class CoursesService {
  constructor(private readonly courseRepository: CourseRepository) {}

  public async getCourses(query: ICourse.Query, user: session_userprofile): Promise<ICourse.DetailWithIsRead[]> {
    const {
      department, type, level, group, keyword, term, order, offset, limit,
    } = query
    const queryResult = await this.courseRepository.getCourses(
      department,
      type,
      level,
      group,
      keyword,
      term,
      order,
      offset,
      limit,
    )
    const resultList: ICourse.DetailWithIsRead[] = []
    const courseIds = queryResult.map((course) => course.id)
    let courseReads: { [key: number]: boolean } = {}
    if (!user) {
      courseIds.forEach((courseId) => {
        courseReads[courseId] = false
      })
    }
    else {
      courseReads = await this.courseRepository.isUserSpecificRead(courseIds, user.id)
    }
    queryResult.map(async (course) => {
      const representativeLecture = getRepresentativeLecture(course.lecture)
      if (!representativeLecture) {
        return
      }
      const professorRaw = course.subject_course_professors.map((x: { professor: any }) => x.professor)
      const result = toJsonCourseDetail(course, representativeLecture, professorRaw)

      const userspecific_is_read = user ? courseReads[course.id] : false

      resultList.push(addIsRead(result, userspecific_is_read))
    })
    return resultList
  }

  public async getCourseByIds(ids: number[], _user: session_userprofile) {
    return Promise.all(ids.map((id) => this.courseRepository.getCourseById(id)))
  }

  public async getCourseById(id: number, user: session_userprofile) {
    const course = await this.courseRepository.getCourseById(id)
    if (!course) {
      throw new NotFoundException()
    }
    const representativeLecture = getRepresentativeLecture(course.lecture)
    const professorRaw = course.subject_course_professors.map((x: { professor: any }) => x.professor)
    const result = toJsonCourseDetail(course, representativeLecture, professorRaw)

    const userspecific_is_read = user
      ? (await this.courseRepository.isUserSpecificRead(course.id, user.id))[course.id]
      : false

    return addIsRead(result, userspecific_is_read)
  }

  public async getLecturesByCourseId(query: ICourse.LectureQueryDto, id: number) {
    const lectures = await this.courseRepository.getLecturesByCourseId(id, query.order)
    if (!lectures) {
      throw new NotFoundException()
    }

    return lectures.map((lecture) => toJsonLectureDetail(lecture))
  }

  public async getReviewsByCourseId(
    query: ICourse.ReviewQueryDto,
    id: number,
    user: session_userprofile,
  ): Promise<IReview.Basic[]> {
    const limit = query.limit ?? 100
    const offset = query.offset ?? 0
    const order = query.order ?? ['-lecture__year', '-lecture__semester', '-written_datetime', '-id']
    const reviews = await this.courseRepository.getReviewsByCourseId({ limit, offset, order }, id)
    if (!reviews) {
      throw new NotFoundException()
    }

    return reviews.map((review) => toJsonReview(review, user))
  }

  async getCourseAutocomplete(dto: ICourse.AutocompleteQueryDto): Promise<string | undefined> {
    const candidate = await this.courseRepository.getCourseAutocomplete(dto.keyword)
    if (!candidate) return dto.keyword
    return this.findAutocompleteFromCandidate(candidate, dto.keyword)
  }

  private findAutocompleteFromCandidate(candidate: ECourse.Extended, keyword: string): string | undefined {
    const keywordLower = keyword.toLowerCase()
    if (candidate.subject_department.name.startsWith(keyword)) return candidate.subject_department.name
    if (candidate.subject_department.name_en?.toLowerCase().startsWith(keywordLower)) return candidate.subject_department.name_en
    if (candidate.title.startsWith(keyword)) return candidate.title
    if (candidate.title_en.toLowerCase().startsWith(keywordLower)) return candidate.title_en
    for (const professor of candidate.subject_course_professors) {
      if (professor.professor.professor_name.startsWith(keyword)) return professor.professor.professor_name
      if (professor.professor.professor_name_en?.toLowerCase().startsWith(keywordLower)) return professor.professor.professor_name_en
    }
    return undefined
  }

  @Transactional()
  async readCourse(userId: number, courseId: number): Promise<ECourseUser.Basic> {
    return await this.courseRepository.readCourse(userId, courseId)
  }
}
