import { BadRequestException, Injectable, PipeTransform, ArgumentMetadata } from '@nestjs/common';
import { PrismaService } from '@otl/prisma-client/prisma.service';

@Injectable()
export class PlannerPipe implements PipeTransform {
  constructor(private prismaService: PrismaService) {}

  async transform(value: any, metadata: ArgumentMetadata): Promise<number> {
    const plannerId = parseInt(value, 10);
    if (isNaN(plannerId)) {
      throw new BadRequestException('Invalid planner ID');
    }

    const planner = await this.prismaService.planner_planner.findUnique({
      where: { id: plannerId },
    });

    if (!planner) {
      throw new BadRequestException('Planner not found');
    }

    return plannerId;
  }
}
