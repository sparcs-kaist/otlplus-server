import { Injectable, NotFoundException } from '@nestjs/common';
import { session_userprofile } from '@prisma/client';
import { EArbitraryPlannerItem } from 'src/common/entities/EArbitraryPlannerItem';
import {
  PlannerBodyDto,
  PlannerQueryDto,
} from 'src/common/interfaces/dto/planner/planner.request.dto';
import {
  ArbitraryPlannerItem,
  FuturePlannerItem,
  LectureDetails,
  PlannerBasic,
  PlannerDetails,
  TakenPlannerItem,
  arbitraryPlannerItem,
  futurePlannerItem,
  plannerDetails,
  takenPlannerItem,
} from 'src/common/schemaTypes/types';
import { orderFilter } from 'src/common/utils/search.utils';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PlannerRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async getPlannerByUser(
    query: PlannerQueryDto,
    user: session_userprofile,
  ): Promise<PlannerDetails[]> {
    return await this.prisma.planner_planner.findMany({
      ...plannerDetails,
      where: {
        user_id: user.id,
      },
      orderBy: orderFilter(query.order),
      skip: query.offset,
      take: query.limit,
    });
  }

  public async getBasicPlannerById(id: number): Promise<PlannerBasic | null> {
    return await this.prisma.planner_planner.findUnique({
      where: {
        id: id,
      },
    });
  }

  public async createPlanner(
    body: PlannerBodyDto,
    arrange_order: number,
    user: session_userprofile,
  ): Promise<PlannerDetails> {
    return await this.prisma.planner_planner.create({
      ...plannerDetails,
      data: {
        session_userprofile: {
          connect: {
            id: user.id,
          },
        },
        graduation_generaltrack: {
          connect: {
            id: body.general_track,
          },
        },
        graduation_majortrack: {
          connect: {
            id: body.major_track,
          },
        },
        planner_planner_additional_tracks: {
          create: body?.additional_tracks?.map((t) => {
            return {
              graduation_additionaltrack: {
                connect: {
                  id: t,
                },
              },
            };
          }),
        },
        start_year: body.start_year,
        end_year: body.end_year,
        arrange_order: arrange_order,
      },
    });
  }

  public async getRelatedPlanner(
    user: session_userprofile,
  ): Promise<PlannerBasic[]> {
    return await this.prisma.planner_planner.findMany({
      where: {
        user_id: user.id,
      },
      orderBy: {
        arrange_order: 'asc',
      },
    });
  }

  public async getTakenPlannerItemById(
    user: session_userprofile,
    id: number,
  ): Promise<TakenPlannerItem> {
    const planner = await this.prisma.planner_planner.findMany({
      include: {
        planner_takenplanneritem: {
          ...takenPlannerItem,
        },
      },
      where: {
        user_id: user.id,
        planner_takenplanneritem: {
          some: {
            id: id,
          },
        },
      },
    });
    const candidates = planner.map((p) => p.planner_takenplanneritem).flat();
    const result = candidates.find((c) => c.id === id);
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }

  public async createTakenPlannerItem(
    planner: PlannerBasic,
    lecture: LectureDetails,
    isExcluded: boolean = false,
  ) {
    return await this.prisma.planner_takenplanneritem.create({
      data: {
        planner_planner: {
          connect: {
            id: planner.id,
          },
        },
        is_excluded: isExcluded,
        subject_lecture: {
          connect: {
            id: lecture.id,
          },
        },
      },
    });
  }
  public async getFuturePlannerItemById(
    user: session_userprofile,
    id: number,
  ): Promise<FuturePlannerItem> {
    const planner = await this.prisma.planner_planner.findMany({
      include: {
        planner_futureplanneritem: {
          ...futurePlannerItem,
        },
      },
      where: {
        user_id: user.id,
        planner_futureplanneritem: {
          some: {
            id: id,
          },
        },
      },
    });
    const candidates = planner.map((p) => p.planner_futureplanneritem).flat();
    const result = candidates.find((c) => c.id === id);
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }

  public async createFuturePlannerItem(
    planner: PlannerBasic,
    target_item: FuturePlannerItem,
  ) {
    return await this.prisma.planner_futureplanneritem.create({
      data: {
        planner_planner: {
          connect: {
            id: planner.id,
          },
        },
        subject_course: {
          connect: {
            id: target_item.course_id,
          },
        },
        is_excluded: target_item.is_excluded,
        year: target_item.year,
        semester: target_item.semester,
      },
    });
  }

  public async getArbitraryPlannerItemById(
    user: session_userprofile,
    id: number,
  ): Promise<ArbitraryPlannerItem> {
    const planner = await this.prisma.planner_planner.findMany({
      include: {
        planner_arbitraryplanneritem: {
          ...arbitraryPlannerItem,
        },
      },
      where: {
        user_id: user.id,
        planner_arbitraryplanneritem: {
          some: {
            id: id,
          },
        },
      },
    });
    const candidates = planner
      .map((p) => p.planner_arbitraryplanneritem)
      .flat();
    const result = candidates.find((c) => c.id === id);
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }

  public async createArbitraryPlannerItem(
    planner: PlannerBasic,
    target_item: Omit<
      ArbitraryPlannerItem,
      'id' | 'planner_id' | 'subject_department'
    >,
  ): Promise<EArbitraryPlannerItem.Details> {
    return await this.prisma.planner_arbitraryplanneritem.create({
      data: {
        planner_planner: {
          connect: {
            id: planner.id,
          },
        },
        subject_department: target_item.department_id
          ? {
              connect: {
                id: target_item.department_id,
              },
            }
          : undefined,
        is_excluded: target_item.is_excluded,
        year: target_item.year,
        semester: target_item.semester,
        type: target_item.type,
        type_en: target_item.type_en,
        credit: target_item.credit,
        credit_au: target_item.credit_au,
      },
      include: EArbitraryPlannerItem.Details.include,
    });
  }
}
