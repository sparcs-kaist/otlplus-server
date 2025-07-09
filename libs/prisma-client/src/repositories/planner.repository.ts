import { BadRequestException, Injectable } from '@nestjs/common'
import { Transactional, TransactionHost } from '@nestjs-cls/transactional'
import { Prisma, session_userprofile } from '@prisma/client'

import { EPlanners } from '../entities/EPlanners'
import CreateInput = EPlanners.EItems.Arbitrary.CreateInput
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'

import { PlannerItemType } from '@otl/common/enum/planner'

import { orderFilter } from '@otl/prisma-client/common/util'
import { PrismaReadService } from '@otl/prisma-client/prisma.read.service'
import { PrismaService } from '@otl/prisma-client/prisma.service'
import { PaginationOption } from '@otl/prisma-client/types/pagination'

@Injectable()
export class PlannerRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
    private readonly prismaRead: PrismaReadService,
  ) {}

  public async getPlannerByUser(query: PaginationOption, user: session_userprofile): Promise<EPlanners.Details[]> {
    return await this.prisma.planner_planner.findMany({
      ...EPlanners.Details,
      where: {
        user_id: user.id,
      },
      orderBy: orderFilter(query.order),
      skip: query.offset,
      take: query.limit,
    })
  }

  public async getBasicPlannerById(id: number): Promise<EPlanners.Basic | null> {
    return await this.prisma.planner_planner.findUnique({
      where: {
        id,
      },
    })
  }

  public async createPlanner(body: EPlanners.CreateBody, user: session_userprofile): Promise<EPlanners.Details> {
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
          create: body?.additional_tracks?.map((t) => ({
            graduation_additionaltrack: {
              connect: {
                id: t,
              },
            },
          })),
        },
        start_year: body.start_year,
        end_year: body.end_year,
        arrange_order: body.arrange_order,
      },
    })
  }

  public async getPlannerById(user: session_userprofile, id: number): Promise<EPlanners.Details | null> {
    return this.prisma.planner_planner.findFirst({
      ...EPlanners.Details,
      where: {
        user_id: user.id,
        id,
      },
    })
  }

  public async updateOrder(plannerId: number, order: number): Promise<EPlanners.Details> {
    return await this.txHost.tx.planner_planner.update({
      ...EPlanners.Details,
      where: {
        id: plannerId,
      },
      data: {
        arrange_order: order,
      },
    })
  }

  public async incrementOrders(plannerIds: number[], from: number, to: number): Promise<void> {
    await this.txHost.tx.planner_planner.updateMany({
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
    })
  }

  public async decrementOrders(plannerIds: number[], from: number, to: number): Promise<void> {
    await this.txHost.tx.planner_planner.updateMany({
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
    })
  }

  public async getRelatedPlanner(user: session_userprofile): Promise<EPlanners.Basic[]> {
    return await this.prisma.planner_planner.findMany({
      where: {
        user_id: user.id,
      },
      orderBy: {
        arrange_order: 'asc',
      },
    })
  }

  public async getTakenPlannerItemByIds(plannerItemIds: number[]): Promise<EPlanners.EItems.Taken.Details[] | null> {
    const plannerItems = await this.prisma.planner_takenplanneritem.findMany({
      include: EPlanners.EItems.Taken.Details.include,
      where: {
        id: {
          in: plannerItemIds,
        },
      },
    })
    return plannerItems.length > 0 ? plannerItems : null
  }

  public async createTakenPlannerItem(
    plannerId: number,
    lectures: {
      lectureId: number
      isExcluded: boolean
    }[],
  ): Promise<EPlanners.EItems.Taken.Basic[]> {
    const datas = lectures.map((lecture) => ({
      planner_id: plannerId,
      is_excluded: lecture.isExcluded,
      lecture_id: lecture.lectureId,
    }))
    await this.prisma.planner_takenplanneritem.createMany({
      data: datas,
    })
    return this.prisma.planner_takenplanneritem.findMany({
      where: {
        planner_id: plannerId,
        lecture_id: {
          in: lectures.map((lecture) => lecture.lectureId),
        },
      },
    })
  }

  public async getFuturePlannerItemById(futureItemIds: number[]): Promise<EPlanners.EItems.Future.Extended[] | null> {
    const futurePlannerItems = await this.prisma.planner_futureplanneritem.findMany({
      include: EPlanners.EItems.Future.Extended.include,
      where: {
        id: {
          in: futureItemIds,
        },
      },
    })
    return futurePlannerItems.length > 0 ? futurePlannerItems : null
  }

  @Transactional()
  public async createFuturePlannerItem(plannerId: number, targetItems: EPlanners.EItems.Future.Extended[]) {
    const createDatas = targetItems.map((target_item) => ({
      planner_id: plannerId,
      course_id: target_item.course_id,
      is_excluded: target_item.is_excluded,
      year: target_item.year,
      semester: target_item.semester,
    }))
    return await this.prisma.planner_futureplanneritem.createMany({
      data: createDatas,
    })
  }

  @Transactional()
  public async deleteFuturePlannerItem(target_item: EPlanners.EItems.Future.Extended) {
    return await this.prisma.planner_futureplanneritem.delete({
      where: {
        id: target_item.id,
      },
    })
  }

  public async getArbitraryPlannerItemById(
    arbitraryItemIds: number[],
  ): Promise<EPlanners.EItems.Arbitrary.Extended[] | null> {
    const arbitraryItems = await this.prisma.planner_arbitraryplanneritem.findMany({
      include: EPlanners.EItems.Arbitrary.Extended.include,
      where: {
        id: {
          in: arbitraryItemIds,
        },
      },
    })
    return arbitraryItems.length > 0 ? arbitraryItems : null
  }

  public async createArbitraryPlannerItem(
    plannerId: number,
    target_items: EPlanners.EItems.Arbitrary.CreateInput[],
  ): Promise<Prisma.BatchPayload>

  public async createArbitraryPlannerItem(
    plannerId: number,
    target_items: EPlanners.EItems.Arbitrary.CreateInput,
  ): Promise<EPlanners.EItems.Arbitrary.Extended>

  @Transactional()
  public async createArbitraryPlannerItem<T extends CreateInput | CreateInput[]>(
    plannerId: number,
    target_items: T,
  ): Promise<Prisma.BatchPayload | EPlanners.EItems.Arbitrary.Extended> {
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
      }))

      return this.prisma.planner_arbitraryplanneritem.createMany({
        data: createDatas,
      })
    }
    const targetItem = target_items as CreateInput
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
    })
  }

  public async deleteArbitraryPlannerItem(target_item: EPlanners.EItems.Arbitrary.Extended) {
    return await this.prisma.planner_arbitraryplanneritem.delete({
      where: {
        id: target_item.id,
      },
    })
  }

  public async checkPlannerExists(plannerId: number): Promise<boolean> {
    const planner = await this.prisma.planner_planner.findFirst({
      where: {
        id: plannerId,
      },
    })
    return !!planner
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
        year,
        semester,
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
    })
  }

  @Transactional()
  async updatePlannerItem(
    item_type: string,
    item: number,
    updatedFields: (
      | Prisma.planner_arbitraryplanneritemUpdateInput
      | Prisma.planner_futureplanneritemUpdateInput
      | Prisma.planner_takenplanneritemUpdateInput
    ) & { semester?: number },
  ): Promise<EPlanners.EItems.Taken.Details | EPlanners.EItems.Future.Extended | EPlanners.EItems.Arbitrary.Extended> {
    if (item_type === PlannerItemType.Taken) {
      return this.prisma.planner_takenplanneritem.update({
        where: {
          id: item,
        },
        data: {
          is_excluded: updatedFields.is_excluded,
        },
        include: EPlanners.EItems.Taken.Details.include,
      })
    }
    if (item_type === PlannerItemType.Future) {
      return this.prisma.planner_futureplanneritem.update({
        where: {
          id: item,
        },
        data: {
          is_excluded: updatedFields.is_excluded,
          semester: updatedFields.semester,
        },
        include: EPlanners.EItems.Future.Extended.include,
      })
    }
    if (item_type === PlannerItemType.Arbitrary) {
      return this.prisma.planner_arbitraryplanneritem.update({
        where: {
          id: item,
        },
        data: {
          is_excluded: updatedFields.is_excluded,
          semester: updatedFields.semester,
        },
        include: EPlanners.EItems.Arbitrary.Extended.include,
      })
    }
    throw new BadRequestException('Invalid Planner Item Type')
  }

  async getTakenPlannerItemByLecture(
    plannerId: number,
    lectureId: number,
  ): Promise<EPlanners.EItems.Taken.Basic | null> {
    return await this.prismaRead.planner_takenplanneritem.findFirst({
      where: {
        planner_id: plannerId,
        lecture_id: lectureId,
      },
    })
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
    })
  }

  @Transactional()
  async updatePlanner(
    plannerId: number,
    updateFields: {
      additional_track_ids: number[]
      start_year: number
      major_track_id: number
      general_track_id: number
      end_year: number
    },
  ): Promise<EPlanners.Details> {
    const existedAdditonalTracks = await this.prisma.planner_planner_additional_tracks.findMany({
      where: {
        planner_id: plannerId,
      },
    })

    const disconnectAdditionalTracks = existedAdditonalTracks.filter(
      (track) => !updateFields.additional_track_ids.includes(track.additionaltrack_id),
    )
    const connectAdditionalTrackIds = updateFields.additional_track_ids.filter(
      (track) => !existedAdditonalTracks.map((t) => t.additionaltrack_id).includes(track),
    )

    await this.prisma.planner_planner_additional_tracks.deleteMany({
      where: {
        planner_id: plannerId,
        additionaltrack_id: {
          in: disconnectAdditionalTracks.map((track) => track.additionaltrack_id),
        },
      },
    })

    await this.prisma.planner_planner_additional_tracks.createMany({
      data: connectAdditionalTrackIds.map((track) => ({
        planner_id: plannerId,
        additionaltrack_id: track,
      })),
    })

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
      },
      include: EPlanners.Details.include,
    })
  }

  @Transactional()
  async deleteFuturePlannerItemsWithWhere(plannerId: number, startYear: number, endYear: number) {
    return await this.prisma.planner_futureplanneritem.deleteMany({
      where: {
        year: {
          lte: startYear,
          gte: endYear,
        },
        planner_id: plannerId,
      },
    })
  }

  @Transactional()
  async deleteArbitraryPlannerItemsWithWhere(plannerId: number, startYear: number, endYear: number) {
    return await this.prisma.planner_arbitraryplanneritem.deleteMany({
      where: {
        year: {
          lte: startYear,
          gte: endYear,
        },
        planner_id: plannerId,
      },
    })
  }

  @Transactional()
  async deleteTakenPlannerItemsWithWhere(
    plannerId: number,
    where: Prisma.XOR<Prisma.Subject_lectureScalarRelationFilter, Prisma.subject_lectureWhereInput>,
  ) {
    return this.prisma.planner_takenplanneritem.deleteMany({
      where: {
        planner_id: plannerId,
        subject_lecture: {
          ...where,
        },
      },
    })
  }

  @Transactional()
  async deletePlanner(plannerId: number) {
    const planner = await this.prisma.planner_planner.findUniqueOrThrow({
      where: {
        id: plannerId,
      },
    })
    const userId = planner.user_id
    const planners = await this.prisma.planner_planner.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        arrange_order: 'asc',
      },
    })
    const deletedPlanner = await this.prisma.planner_planner.delete({
      where: {
        id: plannerId,
      },
    })
    const needToUpdatePlanners = planners.filter((p) => p.arrange_order > deletedPlanner.arrange_order)
    await this.decrementOrders(
      needToUpdatePlanners.map((p) => p.id),
      planner.arrange_order + 1,
      planners.length,
    )
    return deletedPlanner
  }
}
