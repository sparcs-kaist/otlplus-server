import { BadRequestException, Injectable, PipeTransform, ArgumentMetadata } from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';

@Injectable()
export class CourseIdPipe implements PipeTransform {
  constructor(private prismaService: PrismaService) {}

  async transform(value: any, metadata: ArgumentMetadata): Promise<number> {
    const courseId = parseInt(value, 10);
    if (isNaN(courseId)) {
      throw new BadRequestException('Invalid course ID');
    }

    const course = await this.prismaService.subject_course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new BadRequestException('Course not found');
    }

    return courseId;
  }
}
