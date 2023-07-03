import { CourseRepository } from './../../prisma/repositories/course.repository';
import { Injectable } from '@nestjs/common';
import { review_review, subject_course } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(
    private readonly CourseRepository: CourseRepository,
    private prisma: PrismaService
  ) {}

  public async getAllCourses(query: any) {
    const MAX_LIMIT = 150;
    const DEFAULT_ORDER = ['old_code'];

    const {
      department,
      type,
      level,
      group,
      keyword,
      term,
      order,
      offset,
      limit,
    } = query;

    const query_result = await this.prisma.subject_course.findMany({
      include: {
        subject_department: true,
      }
    });
  }
}