import { BadRequestException, Injectable } from '@nestjs/common';
import { session_userprofile } from '@prisma/client';
import { ELecture } from 'src/common/entities/ELecture';
import { IPlanner } from 'src/common/interfaces/IPlanner';
import { orderFilter } from 'src/common/utils/search.utils';
import { EPlanners } from '../../common/entities/EPlanners';
import { PlannerItemType } from '../../common/interfaces/constants/planner';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PlannerRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async getPlannerByUser(
    query: IPlanner.QueryDto,
    user: session_userprofile,
  ): Promise<EPlanners.Details[]> {
    return await this.prisma.planner_planner.findMany({
      ...EPlanners.Details,
      where: {
        user_id: user.id,
      },
      orderBy: orderFilter(query.order),
      skip: query.offset,
      take: query.limit,
    });
  }

  public async getBasicPlannerById(
    id: number,
  ): Promise<EPlanners.Basic | null> {
    return await this.prisma.planner_planner.findUnique({
      where: {
        id: id,
      },
    });
  }

  public async createPlanner(
    body: IPlanner.CreateBodyDto,
    arrange_order: number,
    user: session_userprofile,
  ): Promise<EPlanners.Details> {
    return await this.prisma.planner_planner.create({
      ...EPlanners.Details,
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
  ): Promise<EPlanners.Details | null> {
    return this.prisma.planner_planner.findFirst({
      ...EPlanners.Details,
      where: {
        user_id: user.id,
        id: id,
      },
    });
  }

  public async updateOrder(
    plannerId: number,
    order: number,
  ): Promise<EPlanners.Details> {
    return await this.prisma.planner_planner.update({
      ...EPlanners.Details,
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
  ): Promise<EPlanners.Basic[]> {
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
  ): Promise<EPlanners.EItems.Taken.Details | null> {
    const planner = await this.prisma.planner_planner.findMany({
      include: {
        planner_takenplanneritem: {
          ...EPlanners.EItems.Taken.Details,
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
    planner: EPlanners.Basic,
    lecture: ELecture.Details,
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
  ): Promise<EPlanners.EItems.Future.Extended | null> {
    const planner = await this.prisma.planner_planner.findMany({
      include: {
        planner_futureplanneritem: {
          ...EPlanners.EItems.Future.Extended,
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
    planner: EPlanners.Basic,
    target_item: EPlanners.EItems.Future.Extended,
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

  public async deleteFuturePlannerItem(
    target_item: EPlanners.EItems.Future.Extended,
  ) {
    return await this.prisma.planner_futureplanneritem.delete({
      where: {
        id: target_item.id,
      },
    });
  }

  public async getArbitraryPlannerItemById(
    user: session_userprofile,
    id: number,
  ): Promise<EPlanners.EItems.Arbitrary.Extended | null> {
    const planner = await this.prisma.planner_planner.findMany({
      include: {
        planner_arbitraryplanneritem: {
          ...EPlanners.EItems.Arbitrary.Extended,
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
    planner: EPlanners.Basic,
    target_item: Omit<
      EPlanners.EItems.Arbitrary.Extended,
      'id' | 'planner_id' | 'subject_department'
    >,
  ): Promise<EPlanners.EItems.Arbitrary.Extended> {
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
      include: EPlanners.EItems.Arbitrary.Extended.include,
    });
  }

  public async deleteArbitraryPlannerItem(
    target_item: EPlanners.EItems.Arbitrary.Extended,
  ) {
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
  ): Promise<EPlanners.EItems.Future.Extended> {
    return await this.prisma.planner_futureplanneritem.create({
      ...EPlanners.EItems.Future.Extended,
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
    updatedFields: Pick<IPlanner.UpdateItemBodyDto, 'semester' | 'is_excluded'>,
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
