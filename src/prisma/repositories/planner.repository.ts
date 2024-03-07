import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { session_userprofile } from '@prisma/client';
import { EArbitraryPlannerItem } from 'src/common/entities/EArbitraryPlannerItem';
import {
  PlannerBodyDto,
  PlannerQueryDto,
  PlannerUpdateItemDto,
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
import { PlannerItemType } from '../../common/interfaces/constants/planner';
import { EPlanners } from '../../common/entities/EPlanners';
import EItems = EPlanners.EItems;

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

  public async getPlannerById(
    user: session_userprofile,
    id: number,
  ): Promise<PlannerDetails | null> {
    return this.prisma.planner_planner.findFirst({
      ...plannerDetails,
      where: {
        user_id: user.id,
        id: id,
      },
    });
  }

  public async updateOrder(
    plannerId: number,
    order: number,
  ): Promise<PlannerDetails> {
    return await this.prisma.planner_planner.update({
      ...plannerDetails,
      where: {
        id: plannerId,
      },
      data: {
        arrange_order: order,
      },
    });
  }

  public async incrementOrders(
    plannerIds: number[],
    from: number,
    to: number,
  ): Promise<void> {
    await this.prisma.planner_planner.updateMany({
      where: {
        id: {
          in: plannerIds,
        },
        arrange_order: {
          gte: from,
          lte: to,
        },
      },
      data: {
        arrange_order: {
          increment: 1,
        },
      },
    });
  }

  public async decrementOrders(
    plannerIds: number[],
    from: number,
    to: number,
  ): Promise<void> {
    await this.prisma.planner_planner.updateMany({
      where: {
        id: {
          in: plannerIds,
        },
        arrange_order: {
          gte: from,
          lte: to,
        },
      },
      data: {
        arrange_order: {
          decrement: 1,
        },
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
  ): Promise<TakenPlannerItem | null> {
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
    return candidates.find((c) => c.id === id) ?? null;
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
  ): Promise<FuturePlannerItem | null> {
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
    return candidates.find((c) => c.id === id) ?? null;
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

  public async deleteFuturePlannerItem(target_item: FuturePlannerItem) {
    return await this.prisma.planner_futureplanneritem.delete({
      where: {
        id: target_item.id,
      },
    });
  }

  public async getArbitraryPlannerItemById(
    user: session_userprofile,
    id: number,
  ): Promise<ArbitraryPlannerItem | null> {
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
    return candidates.find((c) => c.id === id) ?? null;
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

  public async deleteArbitraryPlannerItem(target_item: ArbitraryPlannerItem) {
    return await this.prisma.planner_arbitraryplanneritem.delete({
      where: {
        id: target_item.id,
      },
    });
  }

  public async checkPlannerExists(plannerId: number): Promise<boolean> {
    const planner = await this.prisma.planner_planner.findFirst({
      where: {
        id: plannerId,
      },
    });
    return planner ? true : false;
  }

  public async createPlannerItem(
    plannerId: number,
    year: number,
    semester: number,
    courseId: number,
  ): Promise<FuturePlannerItem> {
    return await this.prisma.planner_futureplanneritem.create({
      ...futurePlannerItem,
      data: {
        year: year,
        semester: semester,
        planner_planner: {
          connect: {
            id: plannerId,
          },
        },
        subject_course: {
          connect: {
            id: courseId,
          },
        },
        is_excluded: false,
      },
    });
  }

  async updatePlannerItem(
    item_type: string,
    item: number,
    updatedFields: Pick<PlannerUpdateItemDto, 'semester' | 'is_excluded'>,
  ): Promise<
    | EPlanners.EItems.Taken.Details
    | EPlanners.EItems.Future.Extended
    | EPlanners.EItems.Arbitrary.Extended
  > {
    if (item_type === PlannerItemType.Taken) {
      return this.prisma.planner_takenplanneritem.update({
        where: {
          id: item,
        },
        data: {
          is_excluded: updatedFields.is_excluded,
        },
        include: EPlanners.EItems.Taken.Details.include,
      });
    } else if (item_type === PlannerItemType.Future) {
      return this.prisma.planner_futureplanneritem.update({
        where: {
          id: item,
        },
        data: {
          is_excluded: updatedFields.is_excluded,
          semester: updatedFields.semester,
        },
        include: EPlanners.EItems.Future.Extended.include,
      });
    } else if (item_type === PlannerItemType.Arbitrary) {
      return this.prisma.planner_arbitraryplanneritem.update({
        where: {
          id: item,
        },
        data: {
          is_excluded: updatedFields.is_excluded,
          semester: updatedFields.semester,
        },
        include: EPlanners.EItems.Arbitrary.Extended.include,
      });
    } else {
      throw new BadRequestException('Invalid Planner Item Type');
    }
  }
}
