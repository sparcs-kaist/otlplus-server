import { Injectable } from '@nestjs/common'
import { ICourseV2, IUserV2 } from '@otl/server-nest/common/interfaces'
import { session_userprofile } from '@prisma/client'

import {
  DepartmentRepository,
  LectureRepository,
  ReviewsRepository,
  UserRepositoryV2,
} from '@otl/prisma-client/repositories'

function toJsonDepartment(major: any): any {
  // Safely extract department info from the lecture/major object.
  const dept = major
  return {
    id: dept.id,
    name: dept.name,
  }
}
@Injectable()
export class userV2Service {
  constructor(
    private readonly userRepositoryV2: UserRepositoryV2,
    private readonly lectureRepository: LectureRepository,
    private readonly departmentRepository: DepartmentRepository,
    private readonly reviewRepository: ReviewsRepository,
  ) {}

  async getUnreviewedRandomCourse(user: session_userprofile): Promise<ICourseV2.WritableReview | null> {
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
      id: RandomUnreviewedLecture.course_id,
      name: RandomUnreviewedLecture.title,
      professor: professors_basic,
      year: RandomUnreviewedLecture.year,
      semester: RandomUnreviewedLecture.semester,
      totalRemainingCount: UnreviewedLectures.length,
    }
  }

  async getUserInfo(user: session_userprofile): Promise<IUserV2.Info | null> {
    const name = `${user.first_name} ${user.last_name}`
    const mail = user.email || ''
    const studentNumber = parseInt(user.student_id)
    const { degree } = user
    const [favoriteDepartments, majors] = await Promise.all([
      this.departmentRepository.getFavoriteDepartments(user),
      this.departmentRepository.getMajors(user),
    ])

    return {
      name,
      mail,
      studentNumber,
      degree,
      majorDepartments: majors.map((major) => toJsonDepartment(major)),
      interestedDepartments: favoriteDepartments.map((d) => toJsonDepartment(d)),
    }
  }

  async updateInterestedDepartments(user: session_userprofile, departments: number[]): Promise<void> {
    return this.userRepositoryV2.updateInterestedDepartments(user, departments)
  }
}
