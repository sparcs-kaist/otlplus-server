import { Injectable, NotFoundException } from '@nestjs/common';
import { session_userprofile } from '@prisma/client';
import { ICourse } from 'src/common/interfaces';
import {
  ReviewLikedQueryDto,
  UserTakenCoursesQueryDto,
} from 'src/common/interfaces/dto/user/user.request.dto';
import { ProfileDto } from 'src/common/interfaces/dto/user/user.response.dto';
import {
  addIsRead,
  toJsonCourse,
} from 'src/common/interfaces/serializer/course.serializer';
import { ResearchLecture } from '../../common/interfaces/constants/lecture';
import { ReviewResponseDto } from '../../common/interfaces/dto/reviews/review.response.dto';
import { toJsonDepartment } from '../../common/interfaces/serializer/department.serializer';
import { toJsonLecture } from '../../common/interfaces/serializer/lecture.serializer';
import { toJsonReview } from '../../common/interfaces/serializer/review.serializer';
import { getRepresentativeLecture } from '../../common/utils/lecture.utils';
import { DepartmentRepository } from '../../prisma/repositories/department.repository';
import { LectureRepository } from '../../prisma/repositories/lecture.repository';
import { ReviewsRepository } from '../../prisma/repositories/review.repository';
import { UserRepository } from '../../prisma/repositories/user.repository';
import { CourseRepository } from './../../prisma/repositories/course.repository';

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
    const user = this.userRepository.findBySid(sid);
    if (!user) {
      throw new NotFoundException(`Can't find user with sid: ${sid}`);
    }
  }

  public async getProfile(user: session_userprofile): Promise<ProfileDto> {
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
    ]);
    const departments = [
      ...majors,
      ...minors,
      ...specializedMajors,
      ...favoriteDepartments,
    ];
    const researchLectures = Object.values(ResearchLecture);
    const timeTableLectures = takenLectures.filter(
      (lecture) => !researchLectures.includes(lecture.type_en),
    );

    return {
      id: user.id,
      email: user.email ?? '',
      student_id: user.student_id,
      firstName: user.first_name,
      lastName: user.last_name,
      department: department ? toJsonDepartment(department) : null,
      majors: majors.map((major) => toJsonDepartment(major)),
      departments: departments.map((department) =>
        toJsonDepartment(department),
      ),
      favorite_departments: favoriteDepartments.map((department) =>
        toJsonDepartment(department),
      ),
      review_writable_lectures: reviewWritableLectures.map((lecture) =>
        toJsonLecture<false>(lecture, false),
      ),
      my_timetable_lectures: timeTableLectures.map((lecture) =>
        toJsonLecture<false>(lecture, false),
      ),
      reviews: writtenReviews.map((review) => toJsonReview(review)),
    };
  }

  async getUserTakenCourses(
    query: UserTakenCoursesQueryDto,
    user: session_userprofile,
  ): Promise<ICourse.DetailForPlannerWithIsRead[]> {
    const DEFAULT_ORDER = ['old_code'];
    const takenLectures = await this.lectureRepository.getTakenLectures(user);
    const takenLecturesId = takenLectures.map((lecture) => lecture.id);
    const courses = await this.courseRepository.getUserTakenCourses(
      takenLecturesId,
      query.order ?? DEFAULT_ORDER,
    );
    return Promise.all(
      courses.map(async (course) => {
        const representativeLecture = getRepresentativeLecture(course.lecture);
        const professorRaw = course.subject_course_professors.map(
          (x) => x.professor,
        );
        const result = toJsonCourse<false>(
          course,
          representativeLecture,
          professorRaw,
          false,
        );

        return addIsRead(
          result,
          await this.courseRepository.isUserSpecificRead(course.id, user.id),
        );
      }),
    );
  }

  async getUserLikedReviews(
    user: session_userprofile,
    userId: number,
    query: ReviewLikedQueryDto,
  ): Promise<(ReviewResponseDto & { userspecific_is_liked: boolean })[]> {
    const MAX_LIMIT = 300;
    const DEFAULT_ORDER = ['-written_datetime', '-id'];

    const reviews = await this.reviewRepository.getLikedReviews(
      userId,
      query.order ?? DEFAULT_ORDER,
      query.offset ?? 0,
      query.limit ?? MAX_LIMIT,
    );

    const result = await Promise.all(
      reviews.map(async (review) => {
        const result = toJsonReview(review);
        const isLiked: boolean = await this.reviewRepository.isLiked(
          review.id,
          user.id,
        );
        return Object.assign(result, {
          userspecific_is_liked: isLiked,
        });
      }),
    );

    return result;
  }
}
