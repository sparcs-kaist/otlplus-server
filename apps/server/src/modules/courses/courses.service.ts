import { Injectable, NotFoundException } from '@nestjs/common';
import { session_userprofile } from '@prisma/client';
import { toJsonLectureDetail } from '@src/common/serializer/lecture.serializer';
import { toJsonReview } from '@src/common/serializer/review.serializer';
import { CourseRepository } from '../../prisma/repositories/course.repository';
import { Transactional } from '@nestjs-cls/transactional';
import { ICourse, IReview } from '@otl/api-interface/src/interfaces';
import { getRepresentativeLecture } from '@src/common/utils/lecture.utils';
import { addIsRead, toJsonCourseDetail } from '@src/common/serializer/course.serializer';
import { ECourse } from '@otl/api-interface/src/entities/ECourse';
import ECourseUser = ECourse.ECourseUser;

@Injectable()
export class CoursesService {
  constructor(private readonly courseRepository: CourseRepository) {}

  public async getCourses(query: ICourse.Query, user: session_userprofile): Promise<ICourse.DetailWithIsRead[]> {
    const queryResult = await this.courseRepository.getCourses(query);
    return Promise.all(
      queryResult.map(async (course) => {
        const representativeLecture = getRepresentativeLecture(course.lecture);
        const professorRaw = course.subject_course_professors.map((x: { professor: any }) => x.professor);
        const result = toJsonCourseDetail(course, representativeLecture, professorRaw);

        const userspecific_is_read = user ? await this.courseRepository.isUserSpecificRead(course.id, user.id) : false;

        return addIsRead(result, userspecific_is_read);
      }),
    );
  }

  public async getCourseByIds(ids: number[], user: session_userprofile) {
    return Promise.all(ids.map((id) => this.courseRepository.getCourseById(id)));
  }

  public async getCourseById(id: number, user: session_userprofile) {
    const course = await this.courseRepository.getCourseById(id);
    if (!course) {
      throw new NotFoundException();
    }
    const representativeLecture = getRepresentativeLecture(course.lecture);
    const professorRaw = course.subject_course_professors.map((x: { professor: any }) => x.professor);
    const result = toJsonCourseDetail(course, representativeLecture, professorRaw);

    const userspecific_is_read = user ? await this.courseRepository.isUserSpecificRead(course.id, user.id) : false;

    return addIsRead(result, userspecific_is_read);
  }

  public async getLecturesByCourseId(query: ICourse.LectureQueryDto, id: number) {
    const lectures = await this.courseRepository.getLecturesByCourseId(query, id);
    if (!lectures) {
      throw new NotFoundException();
    }

    return lectures.map((lecture) => toJsonLectureDetail(lecture));
  }

  public async getReviewsByCourseId(
    query: ICourse.ReviewQueryDto,
    id: number,
    user: session_userprofile,
  ): Promise<IReview.Basic[]> {
    query.limit = query.limit ?? 100;
    query.offset = query.offset ?? 0;
    query.order = query.order ?? ['-lecture__year', '-lecture__semester', '-written_datetime', '-id'];
    const reviews = await this.courseRepository.getReviewsByCourseId(query, id);
    if (!reviews) {
      throw new NotFoundException();
    }

    return reviews.map((review) => toJsonReview(review, user));
  }

  async getCourseAutocomplete(dto: ICourse.AutocompleteQueryDto): Promise<string | undefined> {
    const candidate = await this.courseRepository.getCourseAutocomplete(dto);
    if (!candidate) return dto.keyword;
    return this.findAutocompleteFromCandidate(candidate, dto.keyword);
  }

  private findAutocompleteFromCandidate(candidate: ECourse.Extended, keyword: string): string | undefined {
    const keywordLower = keyword.toLowerCase();
    if (candidate.subject_department.name.startsWith(keyword)) return candidate.subject_department.name;
    if (candidate.subject_department.name_en?.toLowerCase().startsWith(keywordLower))
      return candidate.subject_department.name_en;
    if (candidate.title.startsWith(keyword)) return candidate.title;
    if (candidate.title_en.toLowerCase().startsWith(keywordLower)) return candidate.title_en;
    for (const professor of candidate.subject_course_professors) {
      if (professor.professor.professor_name.startsWith(keyword)) return professor.professor.professor_name;
      if (professor.professor.professor_name_en?.toLowerCase().startsWith(keywordLower))
        return professor.professor.professor_name_en;
    }
  }

  @Transactional()
  async readCourse(userId: number, courseId: number): Promise<ECourseUser.Basic> {
    return await this.courseRepository.readCourse(userId, courseId);
  }
}
