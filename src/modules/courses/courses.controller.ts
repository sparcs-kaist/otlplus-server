import { CourseRepository } from './../../prisma/repositories/course.repository';
import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { AuthGuard } from '@nestjs/passport';
import { subject_course } from '@prisma/client';
import { review_review } from '@prisma/client';

@Controller('courses')
export class CourseController {
  constructor(private readonly CoursesService: CoursesService,
    private readonly CourseRepository: CourseRepository) {}

  @Get()
  async getCourses(@Query() query: any): Promise<course[]> {
    const courses = await this.CoursesService.getAllCourses(query);

    return courses.map((course) => this.CoursesService.courseToJson(course));
  }

  @Get(':id')
  async getCourse(@Param('id') id: string): Promise<Course> {
    return this.CoursesService.getCourseById(id);
  }

  @Get('autocomplete')
  async getCourseAutocomplete(@Query() query: any): Promise<any> {
    const { keyword } = query;
    return this.CoursesService.getAutocompleteResults(keyword);
  }

  @Get(':id/reviews')
  async getCourseReviews(
    @Param('id') id: string,
    @Query() query: any,
  ): Promise<review[]> {
    const MAX_LIMIT = 100;
    const DEFAULT_ORDER = ['-lecture.year', '-lecture.semester', '-written_datetime', '-id'];

    const { order, offset, limit } = query;

    const course = await this.CoursesService.getCourseById(id);
    const reviews = await this.CoursesService.getReviewsByCourse(course);

    let filteredReviews = await this.CoursesService.applyOrder(
      reviews,
      order,
      DEFAULT_ORDER,
    );
    filteredReviews = await this.CoursesService.applyOffsetAndLimit(
      filteredReviews,
      offset,
      limit,
      MAX_LIMIT,
    );

    return filteredReviews.map((review) => this.CoursesService.mapReviewToJSON(review));
  }

  @Get(':id/lectures')
  async getCourseLectures(@Param('id') id: string, @Query() query: any): Promise<any> {
    const DEFAULT_ORDER = ['year', 'semester', 'class_no'];

    const { order } = query;

    const course = await this.CoursesService.getCourseById(id);
    const lectures = await this.CoursesService.getLecturesByCourse(course);

    const filteredLectures = await this.CoursesService.applyOrder(
      lectures,
      order,
      DEFAULT_ORDER,
    );

    return filteredLectures.map((lecture) => this.CoursesService.mapLectureToJSON(lecture));
  }

  @Post(':id/read')
  @UseGuards(AuthGuard('jwt'))
  async markCourseAsRead(@Param('id') id: string): Promise<void> {
    const course = await this.CoursesService.getCourseById(id);
    const profile = request.user.userprofile;

    try {
      const courseUser = await this.CoursesService.getCourseUser(profile, course);
      await this.CoursesService.saveCourseUser(courseUser);
    } catch (error) {
      await this.CoursesService.createCourseUser(profile, course);
    }
  }
}
