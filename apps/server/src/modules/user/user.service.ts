import { Injectable, NotFoundException } from '@nestjs/common'
import { ICourse, IReview, IUser } from '@otl/server-nest/common/interfaces'
import { addIsRead, toJsonCourseDetail } from '@otl/server-nest/common/serializer/course.serializer'
import { toJsonDepartment } from '@otl/server-nest/common/serializer/department.serializer'
import { toJsonLectureDetail } from '@otl/server-nest/common/serializer/lecture.serializer'
import { toJsonReview } from '@otl/server-nest/common/serializer/review.serializer'
import { getRepresentativeLecture } from '@otl/server-nest/common/utils/lecture.utils'
import { session_userprofile } from '@prisma/client'

import { ResearchLecture } from '@otl/common/enum/lecture'

import {
  CourseRepository,
  DepartmentRepository,
  LectureRepository,
  ReviewsRepository,
  UserRepository,
} from '@otl/prisma-client/repositories'

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly lectureRepository: LectureRepository,
    private readonly departmentRepository: DepartmentRepository,
    private readonly reviewRepository: ReviewsRepository,
    private readonly courseRepository: CourseRepository,
  ) {}

  public async findBySid(sid: string) {
    const user = this.userRepository.findBySid(sid)
    if (!user) {
      throw new NotFoundException(`Can't find user with sid: ${sid}`)
    }
  }

  public async getProfile(user: session_userprofile): Promise<IUser.Profile> {
    const [
      department,
      favoriteDepartments,
      majors,
      minors,
      specializedMajors,
      reviewWritableLectures,
      takenLectures,
      writtenReviews,
    ] = await Promise.all([
      this.departmentRepository.getDepartmentOfUser(user),
      this.departmentRepository.getFavoriteDepartments(user),
      this.departmentRepository.getMajors(user),
      this.departmentRepository.getMinors(user),
      this.departmentRepository.getSpecializedMajors(user),
      this.lectureRepository.findReviewWritableLectures(user, new Date()),
      this.lectureRepository.getTakenLectures(user),
      this.reviewRepository.findReviewByUser(user),
    ])
    const departments = [...majors, ...minors, ...specializedMajors, ...favoriteDepartments]
    const researchLectures: string[] = Object.values(ResearchLecture)
    const timeTableLectures = takenLectures.filter((lecture) => !researchLectures.includes(lecture.type_en))

    return {
      id: user.id,
      email: user.email ?? '',
      student_id: user.student_id,
      firstName: user.first_name,
      lastName: user.last_name,
      department: department ? toJsonDepartment(department) : null,
      majors: majors.map((major) => toJsonDepartment(major)),
      departments: departments.map((d) => toJsonDepartment(d)),
      favorite_departments: favoriteDepartments.map((d) => toJsonDepartment(d)),
      review_writable_lectures: reviewWritableLectures.map((lecture) => toJsonLectureDetail(lecture)),
      my_timetable_lectures: timeTableLectures.map((lecture) => toJsonLectureDetail(lecture)),
      reviews: writtenReviews.map((review) => toJsonReview(review)),
    }
  }

  async getUserTakenCourses(
    query: IUser.TakenCoursesQueryDto,
    user: session_userprofile,
  ): Promise<ICourse.DetailWithIsRead[]> {
    const DEFAULT_ORDER = ['old_code']
    const takenLectures = await this.lectureRepository.getTakenLectures(user)
    const takenLecturesId = takenLectures.map((lecture) => lecture.id)
    const courses = await this.courseRepository.getUserTakenCourses(takenLecturesId, query.order ?? DEFAULT_ORDER)
    return courses.map((course) => {
      const representativeLecture = getRepresentativeLecture(course.lecture)
      const professorRaw = course.subject_course_professors.map((x) => x.professor)
      const result = toJsonCourseDetail(course, representativeLecture, professorRaw)
      const subjectCourseUser = course.subject_courseuser.filter(
        (e) => e.user_profile_id === user.id && e.course_id === course.id,
      )[0]
      if (!subjectCourseUser || !course.latest_written_datetime) return addIsRead(result, false)
      return addIsRead(result, course.latest_written_datetime > subjectCourseUser?.latest_read_datetime)
    })
  }

  async getUserLikedReviews(
    user: session_userprofile,
    userId: number,
    query: IUser.ReviewLikedQueryDto,
  ): Promise<(IReview.Basic & { userspecific_is_liked: boolean })[]> {
    const MAX_LIMIT = 300
    const DEFAULT_ORDER = ['-written_datetime', '-id']

    const reviews = await this.reviewRepository.getLikedReviews(
      userId,
      query.order ?? DEFAULT_ORDER,
      query.offset ?? 0,
      query.limit ?? MAX_LIMIT,
    )

    const result = await Promise.all(
      reviews.map(async (review) => {
        const reviewJson = toJsonReview(review)
        const isLiked: boolean = await this.reviewRepository.isLiked(review.id, user.id)
        return Object.assign(reviewJson, {
          userspecific_is_liked: isLiked,
        })
      }),
    )

    return result
  }
}
