import { Injectable, NotFoundException } from '@nestjs/common';
import { session_userprofile } from '@prisma/client';
import { ECourse } from 'src/common/entities/ECourse';
import { ICourse } from 'src/common/interfaces';
import { CourseQueryDto } from 'src/common/interfaces/dto/course/course.request.dto';
import { CourseReviewQueryDto } from 'src/common/interfaces/dto/course/course.review.request.dto';
import { toJsonLecture } from 'src/common/interfaces/serializer/lecture.serializer';
import { toJsonReview } from 'src/common/interfaces/serializer/review.serializer';
import { CourseResponseDtoNested } from '../../common/interfaces/dto/course/course.response.dto';
import { toJsonCourse } from '../../common/interfaces/serializer/course.serializer';
import { getRepresentativeLecture } from '../../common/utils/lecture.utils';
import { CourseRepository } from './../../prisma/repositories/course.repository';

@Injectable()
export class CoursesService {
  constructor(private readonly courseRepository: CourseRepository) {}

  public async getCourses(
    query: CourseQueryDto,
    user: session_userprofile,
  ): Promise<(CourseResponseDtoNested & { userspecific_is_read: boolean })[]> {
    const queryResult = await this.courseRepository.filterByRequest(query);
    return Promise.all(
      queryResult.map(async (course) => {
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

        const userspecific_is_read = user
          ? await this.courseRepository.isUserSpecificRead(course.id, user.id)
          : false;

        return Object.assign(result, {
          userspecific_is_read,
        });
      }),
    );
  }

  public async getCourseById(id: number, user: session_userprofile) {
    const course = await this.courseRepository.getCourseById(id);
    if (!course) {
      throw new NotFoundException();
    }
    const representativeLecture = getRepresentativeLecture(course.lecture);
    const professorRaw = course.subject_course_professors.map(
      (x) => x.professor,
    );
    const result = toJsonCourse(
      course,
      representativeLecture,
      professorRaw,
      false,
    );

    const userspecific_is_read = user
      ? await this.courseRepository.isUserSpecificRead(course.id, user.id)
      : false;

    return Object.assign(result, {
      userspecific_is_read,
    });
  }

  public async getLecturesByCourseId(query: { order: string[] }, id: number) {
    const lectures = await this.courseRepository.getLecturesByCourseId(
      query,
      id,
    );
    if (!lectures) {
      throw new NotFoundException();
    }

    return lectures.map((lecture) => toJsonLecture<false>(lecture, false));
  }

  public async getReviewsByCourseId(
    query: CourseReviewQueryDto,
    id: number,
    user: session_userprofile,
  ) {
    query.limit = query.limit ?? 100;
    query.offset = query.offset ?? 0;
    query.order = query.order ?? [
      '-lecture__year',
      '-lecture__semester',
      '-written_datetime',
      '-id',
    ];
    const reviews = await this.courseRepository.getReviewsByCourseId(query, id);
    if (!reviews) {
      throw new NotFoundException();
    }

    return reviews.map((review) => toJsonReview(review, user));
  }

  async getCourseAutocomplete(dto: ICourse.AutocompleteDto) {
    const candidate = await this.courseRepository.getCourseAutocomplete(dto);
    if (!candidate) return dto.keyword;
    return this.findAutocompleteFromCandidate(candidate, dto.keyword);
  }

  private findAutocompleteFromCandidate(
    candidate: ECourse.Extended,
    keyword: string,
  ) {
    const keywordLower = keyword.toLowerCase();
    if (candidate.subject_department.name.startsWith(keyword))
      return candidate.subject_department.name;
    if (
      candidate.subject_department.name_en
        ?.toLowerCase()
        .startsWith(keywordLower)
    )
      return candidate.subject_department.name_en;
    if (candidate.title.startsWith(keyword)) return candidate.title;
    if (candidate.title_en.toLowerCase().startsWith(keywordLower))
      return candidate.title_en;
    for (const professor of candidate.subject_course_professors) {
      if (professor.professor.professor_name.startsWith(keyword))
        return professor.professor.professor_name;
      if (
        professor.professor.professor_name_en
          ?.toLowerCase()
          .startsWith(keywordLower)
      )
        return professor.professor.professor_name_en;
    }
  }

  async readCourse(userId: number, courseId: number) {
    await this.courseRepository.readCourse(userId, courseId);
  }
}
