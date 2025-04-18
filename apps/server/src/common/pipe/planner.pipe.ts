import {
  ArgumentMetadata, BadRequestException, Injectable, PipeTransform,
} from '@nestjs/common'

import { PrismaService } from '@otl/prisma-client/prisma.service'

@Injectable()
export class PlannerPipe implements PipeTransform {
  constructor(private prismaService: PrismaService) {}

  async transform(value: any, _metadata: ArgumentMetadata): Promise<number> {
    const plannerId = parseInt(value)
    if (Number.isNaN(plannerId)) {
      throw new BadRequestException('Invalid planner ID')
    }

    const planner = await this.prismaService.planner_planner.findUnique({
      where: { id: plannerId },
    })

    if (!planner) {
      throw new BadRequestException('Planner not found')
    }

    return plannerId
  }
}
