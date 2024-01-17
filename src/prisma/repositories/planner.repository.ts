import { Injectable } from '@nestjs/common';
import { session_userprofile } from '@prisma/client';
import { PlannerRequestDtoDefault } from 'src/common/interfaces/dto/planner/planner.request.dto';
import { orderFilter } from 'src/common/utils/search.utils';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PlannerRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async getPlannerByUser(
    query: PlannerRequestDtoDefault,
    user: session_userprofile,
  ) {
    return await this.prisma.planner_planner.findMany({
      where: {
        user_id: user.id,
      },
      orderBy: orderFilter(query.order),
      skip: query.offset,
      take: query.limit,
    });
  }
}
