import {
  ArgumentMetadata, BadRequestException, Injectable, PipeTransform,
} from '@nestjs/common'

import { PrismaService } from '@otl/prisma-client/prisma.service'

@Injectable()
export class CourseIdPipe implements PipeTransform {
  constructor(private prismaService: PrismaService) {}

  async transform(value: any, _metadata: ArgumentMetadata): Promise<number> {
    const courseId = parseInt(value)
    if (Number.isNaN(courseId)) {
      throw new BadRequestException('Invalid course ID')
    }

    const course = await this.prismaService.subject_course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      throw new BadRequestException('Course not found')
    }

    return courseId
  }
}
