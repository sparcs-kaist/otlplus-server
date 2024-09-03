import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, session_userprofile } from '@prisma/client';
import { IPlanner } from 'src/common/interfaces/IPlanner';
import { orderFilter } from 'src/common/utils/search.utils';
import { EPlanners } from '../../common/entities/EPlanners';
import { PlannerItemType } from '../../common/interfaces/constants/planner';
import { PrismaService } from '../prisma.service';
import CreateInput = EPlanners.EItems.Arbitrary.CreateInput;

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

  public async getTakenPlannerItemByIds(
    plannerItemIds: number[],
  ): Promise<EPlanners.EItems.Taken.Details[] | null> {
    const plannerItems = await this.prisma.planner_takenplanneritem.findMany({
      include: EPlanners.EItems.Taken.Details.include,
      where: {
        id: {
          in: plannerItemIds,
        },
      },
    });
    return plannerItems.length > 0 ? plannerItems : null;
  }

  public async createTakenPlannerItem(
    plannerId: number,
    lectures: {
      lectureId: number;
      isExcluded: boolean;
    }[],
  ): Promise<EPlanners.EItems.Taken.Basic[]> {
    const datas = lectures.map((lecture) => {
      return {
        planner_id: plannerId,
        is_excluded: lecture.isExcluded,
        lecture_id: lecture.lectureId,
      };
    });
    await this.prisma.planner_takenplanneritem.createMany({
      data: datas,
    });
    return this.prisma.planner_takenplanneritem.findMany({
      where: {
        planner_id: plannerId,
        lecture_id: {
          in: lectures.map((lecture) => lecture.lectureId),
        },
      },
    });
  }
  public async getFuturePlannerItemById(
    futureItemIds: number[],
  ): Promise<EPlanners.EItems.Future.Extended[] | null> {
    const futurePlannerItems =
      await this.prisma.planner_futureplanneritem.findMany({
        include: EPlanners.EItems.Future.Extended.include,
        where: {
          id: {
            in: futureItemIds,
          },
        },
      });
    return futurePlannerItems.length > 0 ? futurePlannerItems : null;
  }

  public async createFuturePlannerItem(
    plannerId: number,
    targetItems: EPlanners.EItems.Future.Extended[],
  ) {
    const createDatas = targetItems.map((target_item) => {
      return {
        planner_id: plannerId,
        course_id: target_item.course_id,
        is_excluded: target_item.is_excluded,
        year: target_item.year,
        semester: target_item.semester,
      };
    });
    return await this.prisma.planner_futureplanneritem.createMany({
      data: createDatas,
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
    arbitraryItemIds: number[],
  ): Promise<EPlanners.EItems.Arbitrary.Extended[] | null> {
    const arbitraryItems =
      await this.prisma.planner_arbitraryplanneritem.findMany({
        include: EPlanners.EItems.Arbitrary.Extended.include,
        where: {
          id: {
            in: arbitraryItemIds,
          },
        },
      });
    return arbitraryItems.length > 0 ? arbitraryItems : null;
  }

  public async createArbitraryPlannerItem(
    plannerId: number,
    target_items: CreateInput[],
  ): Promise<Prisma.BatchPayload>;

  public async createArbitraryPlannerItem(
    plannerId: number,
    target_items: CreateInput,
  ): Promise<EPlanners.EItems.Arbitrary.Extended>;

  public async createArbitraryPlannerItem<
    T extends CreateInput | CreateInput[],
  >(plannerId: number, target_items: T): Promise<any> {
    if (Array.isArray(target_items)) {
      const createDatas = target_items.map((targetItem: CreateInput) => ({
        planner_id: plannerId,
        department_id: targetItem.department_id,
        is_excluded: targetItem.is_excluded,
        year: targetItem.year,
        semester: targetItem.semester,
        type: targetItem.type,
        type_en: targetItem.type_en,
        credit: targetItem.credit,
        credit_au: targetItem.credit_au,
      }));

      return await this.prisma.planner_arbitraryplanneritem.createMany({
        data: createDatas,
      });
    } else {
      const targetItem = target_items as CreateInput;
      return await this.prisma.planner_arbitraryplanneritem.create({
        include: EPlanners.EItems.Arbitrary.Extended.include,
        data: {
          planner_id: plannerId,
          department_id: targetItem.department_id,
          is_excluded: targetItem.is_excluded,
          year: targetItem.year,
          semester: targetItem.semester,
          type: targetItem.type,
          type_en: targetItem.type_en,
          credit: targetItem.credit,
          credit_au: targetItem.credit_au,
        },
      });
    }
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

  async getTakenPlannerItemByLecture(
    plannerId: number,
    lectureId: number,
  ): Promise<EPlanners.EItems.Taken.Basic | null> {
    return await this.prisma.planner_takenplanneritem.findFirst({
      where: {
        planner_id: plannerId,
        lecture_id: lectureId,
      },
    });
  }

  async getTakenPlannerItemByLectures(
    plannerId: number,
    lectureIds: number[],
  ): Promise<EPlanners.EItems.Taken.Basic[]> {
    return await this.prisma.planner_takenplanneritem.findMany({
      where: {
        planner_id: plannerId,
        lecture_id: {
          in: lectureIds,
        },
      },
    });
  }

  async updatePlanner(
    plannerId: number,
    updateFields: {
      additional_track_ids: number[];
      start_year: number;
      major_track_id: number;
      general_track_id: number;
      end_year: number;
    },
  ) {
    const existedAdditonalTracks =
      await this.prisma.planner_planner_additional_tracks.findMany({
        where: {
          planner_id: plannerId,
        },
      });

    const disconnectAdditionalTracks = existedAdditonalTracks.filter(
      (track) =>
        !updateFields.additional_track_ids.includes(track.additionaltrack_id),
    );
    const connectAdditionalTrackIds = updateFields.additional_track_ids.filter(
      (track) =>
        !existedAdditonalTracks
          .map((t) => t.additionaltrack_id)
          .includes(track),
    );

    return this.prisma.planner_planner.update({
      where: {
        id: plannerId,
      },
      data: {
        start_year: updateFields.start_year,
        end_year: updateFields.end_year,
        graduation_majortrack: {
          connect: {
            id: updateFields.major_track_id,
          },
        },
        graduation_generaltrack: {
          connect: {
            id: updateFields.general_track_id,
          },
        },
        planner_planner_additional_tracks: {
          disconnect: disconnectAdditionalTracks.map((track) => ({
            id: track.id,
          })),
          connect: connectAdditionalTrackIds.map((trackId) => ({
            id: trackId,
          })),
        },
      },
      include: EPlanners.Details.include,
    });
  }

  async deleteFuturePlannerItemsWithWhere(
    plannerId: number,
    where: Prisma.planner_futureplanneritemDeleteManyArgs,
  ) {
    return await this.prisma.planner_futureplanneritem.deleteMany({
      where: {
        ...where,
        planner_id: plannerId,
      },
    });
  }

  async deleteArbitraryPlannerItemsWithWhere(
    plannerId: number,
    where: Prisma.planner_arbitraryplanneritemDeleteManyArgs,
  ) {
    return await this.prisma.planner_arbitraryplanneritem.deleteMany({
      where: {
        ...where,
        planner_id: plannerId,
      },
    });
  }

  async deleteTakenPlannerItemsWithWhere(
    plannerId: number,
    where: Prisma.XOR<
      Prisma.Subject_lectureRelationFilter,
      Prisma.subject_lectureWhereInput
    >,
  ) {
    return this.prisma.planner_takenplanneritem.deleteMany({
      where: {
        planner_id: plannerId,
        subject_lecture: {
          ...where,
        },
      },
    });
  }
}
