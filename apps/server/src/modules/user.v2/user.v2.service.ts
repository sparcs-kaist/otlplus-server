import { Injectable } from '@nestjs/common'
import { ICourse } from '@otl/server-nest/common/interfaces'
import { session_userprofile } from '@prisma/client'

import {
  CourseRepository,
  DepartmentRepository,
  LectureRepository,
  ReviewsRepository,
  UserRepository,
} from '@otl/prisma-client/repositories'

@Injectable()
export class v2UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly lectureRepository: LectureRepository,
    private readonly departmentRepository: DepartmentRepository,
    private readonly reviewRepository: ReviewsRepository,
    private readonly courseRepository: CourseRepository,
  ) {}

  async getUnreviewedRandomCourse(user: session_userprofile): Promise<ICourse.WritableReview | null> {
    const WrittenReviews = await this.reviewRepository.findReviewByUser(user)
    const TakenLectures = await this.lectureRepository.getTakenLectures(user)
    let UnreviewedLectures = TakenLectures
    for (const review of WrittenReviews) {
      UnreviewedLectures = UnreviewedLectures.filter((lecture) => lecture.id !== review.lecture_id)
    }
    if (UnreviewedLectures.length === 0) {
      return null
    }
    const RandomUnreviewedLecture = UnreviewedLectures[Math.floor(Math.random() * UnreviewedLectures.length)]
    const professsors = RandomUnreviewedLecture.subject_lecture_professors
    const professors_basic = professsors.map((professor) => ({
      id: professor.professor.professor_id,
      name: professor.professor.professor_name,
    }))
    return {
      id: RandomUnreviewedLecture.id,
      name: RandomUnreviewedLecture.title,
      professor: professors_basic,
      year: RandomUnreviewedLecture.year,
      semester: RandomUnreviewedLecture.semester,
      totalRemainingCount: UnreviewedLectures.length,
    }
  }
  /*
  async getUserInfo(user: session_userprofile): Promise<IUser.Info | null> {
    const name = user.first_name + ' ' + user.last_name
    const mail = user.email
    const studentNumber = parseInt(user.student_id, 10)
    const degree = await this.userRepository.getUserDegree(user)
  }

  public async getProfile(user: session_userprofile): Promise<IUser.Info | null> {
      const [
        favoriteDepartments,
        majors,
      ] = await Promise.all([
        this.departmentRepository.getFavoriteDepartments(user),
        this.lectureRepository.getTakenLectures(user),
      ])

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
      }
    } */
}
