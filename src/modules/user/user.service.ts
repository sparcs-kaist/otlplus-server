import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { session_userprofile, subject_department } from '@prisma/client';
import { CourseResponseDtoNested } from 'src/common/interfaces/dto/course/course.response.dto';
import {
  UserFeedsQueryDto,
  UserTakenCoursesQueryDto,
} from 'src/common/interfaces/dto/user/user.request.dto';
import { ProfileDto } from 'src/common/interfaces/dto/user/user.response.dto';
import { toJsonCourse } from 'src/common/interfaces/serializer/course.serializer';
import { ResearchLecture } from '../../common/interfaces/constants/lecture';
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

  async getUserFeeds(
    query: UserFeedsQueryDto,
    user: session_userprofile,
  ): Promise<void> {
    const { date: dateString } = query;
    let date;
    try {
      date = new Date(dateString);
    } catch (error) {
      throw new BadRequestException('Invalid date format');
    }
    const departments: subject_department[] =
      this.departmentRepository.getRelatedDepartments(user);

    //   famous_humanity_review_daily_feed = FamousHumanityReviewDailyFeed.get(date=date)

    //   ranked_review_daily_feed = RankedReviewDailyFeed.get(date=date)

    //   review_write_daily_user_feed = ReviewWriteDailyUserFeed.get(date=date, user=userprofile)

    //   related_course_daily_user_feed = RelatedCourseDailyUserFeed.get(date=date, user=userprofile)

    //   rate_daily_user_feed = RateDailyUserFeed.get(date=date, user=userprofile)

    //   feeds = (
    //       famous_major_review_daily_feed_list
    //       + [famous_humanity_review_daily_feed]
    //       + [ranked_review_daily_feed]
    //       + [review_write_daily_user_feed]
    //       + [related_course_daily_user_feed]
    //       + [rate_daily_user_feed]
    //   )
    //   feeds = [f for f in feeds if f is not None]
    //   feeds = sorted(feeds, key=(lambda f: f.priority))
    //   result = [f.to_json(user=request.user) for f in feeds]
  }

  async getUserTakenCourses(
    query: UserTakenCoursesQueryDto,
    user: session_userprofile,
  ): Promise<(CourseResponseDtoNested & { userspecific_is_read: boolean })[]> {
    const DEFAULT_ORDER = ['old_code'];
    const takenLectures = await this.lectureRepository.getTakenLectures(user);
    const takenLecturesId = takenLectures.map((lecture) => lecture.id);
    const courses = await this.courseRepository.getUserTakenCourses(
      takenLecturesId,
      query.order ?? DEFAULT_ORDER,
    );
    return courses.map((course) => {
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

      if (user) {
        const latestReadDatetime = course.subject_courseuser.find(
          (x) => (x.user_profile_id = user.id),
        )?.latest_read_datetime;
        const latestWrittenDatetime = course.latest_written_datetime;

        return Object.assign(result, {
          userspecific_is_read:
            latestReadDatetime && latestWrittenDatetime
              ? latestWrittenDatetime < latestReadDatetime
              : false,
        });
      } else {
        return Object.assign(result, {
          userspecific_is_read: false,
        });
      }
    });
  }
}
