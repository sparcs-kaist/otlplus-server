import {
  BadRequestException,
  Injectable,
  PipeTransform,
  ArgumentMetadata,
} from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';

@Injectable()
export class CourseIdPipe implements PipeTransform {
  constructor(private prismaService: PrismaService) {}

  async transform(value: any, metadata: ArgumentMetadata): Promise<number> {
    const plannerId = parseInt(value, 10);
    if (isNaN(plannerId)) {
      throw new BadRequestException('Invalid course ID');
    }

    const planner = await this.prismaService.planner_planner.findUnique({
      where: { id: plannerId },
    });

    if (!planner) {
      throw new BadRequestException('Course not found');
    }

    return plannerId;
  }
}
