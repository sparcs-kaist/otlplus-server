import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { Transactional } from '@nestjs-cls/transactional'
import { IPlanner } from '@otl/server-nest/common/interfaces'
import { toJsonArbitraryItem, toJsonFutureItem } from '@otl/server-nest/common/serializer/planner.item.serializer'
import { toJsonPlanner, toJsonPlannerDetails } from '@otl/server-nest/common/serializer/planner.serializer'
import { session_userprofile } from '@prisma/client'

import { EPlanners } from '@otl/prisma-client'
import {
  CourseRepository,
  DepartmentRepository,
  LectureRepository,
  PlannerRepository,
  SemesterRepository,
  UserRepository,
} from '@otl/prisma-client/repositories'

@Injectable()
export class PlannersService {
  constructor(
    private readonly plannerRepository: PlannerRepository,
    private readonly lectureRepository: LectureRepository,
    private readonly departmentRepository: DepartmentRepository,
    private readonly courseRepository: CourseRepository,
    private readonly semesterRepository: SemesterRepository,
    private readonly userRepository: UserRepository,
  ) {}

  public async getPlannerByUser(query: IPlanner.QueryDto, user: session_userprofile) {
    const queryResult = await this.plannerRepository.getPlannerByUser(query, user)
    return queryResult.map(toJsonPlannerDetails)
  }

  async getRelatedPlanner(user: session_userprofile) {
    return await this.plannerRepository.getRelatedPlanner(user)
  }

  @Transactional()
  public async postPlanner(body: IPlanner.CreateBodyDto, user: session_userprofile): Promise<IPlanner.Detail> {
    const relatedPlanner = await this.getRelatedPlanner(user)
    const arrangeOrder = relatedPlanner.length === 0 ? 0 : relatedPlanner[relatedPlanner.length - 1].arrange_order + 1
    // @Todo: Domain 영역으로 변환하기. Clean Architecture 도입 필요
    const createBody = {
      start_year: body.start_year,
      end_year: body.end_year,
      general_track: body.general_track,
      major_track: body.major_track,
      additional_tracks: body.additional_tracks ?? [],
      arrange_order: arrangeOrder,
    }
    const planner = await this.plannerRepository.createPlanner(createBody, user)

    if (body.should_update_taken_semesters) {
      const takenLectures = await this.lectureRepository.findReviewWritableLectures(user, new Date())
      const valid_takenLectures = takenLectures.filter((lecture) => {
        const validStartYear = lecture.year >= body.start_year
        const validEndYear = lecture.year <= body.end_year
        return validStartYear && validEndYear
      })
      await this.plannerRepository.createTakenPlannerItem(
        planner.id,
        valid_takenLectures.map((lecture) => ({ lectureId: lecture.id, isExcluded: false })),
      )
    }

    await Promise.all([
      (async () => {
        const takenTargetItems = await this.plannerRepository.getTakenPlannerItemByIds(body.taken_items_to_copy)
        await this.plannerRepository.createTakenPlannerItem(
          planner.id,
          takenTargetItems?.map((item) => ({ lectureId: item.lecture_id, isExcluded: item.is_excluded })) || [],
        )
      })(),
      (async () => {
        const futureTargetItems = await this.plannerRepository.getFuturePlannerItemById(body.future_items_to_copy)
        await this.plannerRepository.createFuturePlannerItem(planner.id, futureTargetItems || [])
      })(),
      (async () => {
        const targetItems = await this.plannerRepository.getArbitraryPlannerItemById(body.arbitrary_items_to_copy)
        await this.plannerRepository.createArbitraryPlannerItem(planner.id, targetItems || [])
      })(),
    ])

    const newPlanner = await this.plannerRepository.getPlannerById(user, planner.id)
    if (!newPlanner) {
      throw new NotFoundException()
    }

    return toJsonPlannerDetails(newPlanner)
  }

  @Transactional()
  async addArbitraryItem(
    plannerId: number,
    body: IPlanner.AddArbitraryItemDto,
    user: session_userprofile,
  ): Promise<IPlanner.IItem.Arbitrary> {
    const planner = await this.plannerRepository.getBasicPlannerById(plannerId)
    if (!planner) throw new NotFoundException()
    if (planner.user_id !== user.id) throw new UnauthorizedException()

    const department = await this.departmentRepository.getBasicDepartmentById(body.department)

    const data = {
      planner_id: planner.id,
      year: body.year,
      semester: body.semester,
      department_id: department?.id || null,
      type: body.type,
      type_en: body.type_en,
      credit: body.credit,
      credit_au: body.credit_au,
      is_excluded: false,
    }

    const arbitraryItem = await this.plannerRepository.createArbitraryPlannerItem(planner.id, data)
    return toJsonArbitraryItem(arbitraryItem)
  }

  @Transactional()
  public async removePlannerItem(
    plannerId: number,
    removeItem: IPlanner.RemoveItemBodyDto,
    user: session_userprofile,
  ): Promise<IPlanner.Detail> {
    switch (removeItem.item_type) {
      case 'TAKEN':
        throw new BadRequestException('Planner item with type "taken" can\'t be deleted')
      case 'FUTURE': {
        const futureItem = await this.plannerRepository.getFuturePlannerItemById([removeItem.item])
        if (!futureItem || futureItem[0].planner_id !== plannerId) {
          throw new NotFoundException()
        }
        await this.plannerRepository.deleteFuturePlannerItem(futureItem[0])
        break
      }
      case 'ARBITRARY': {
        const arbitraryItem = await this.plannerRepository.getArbitraryPlannerItemById([removeItem.item])
        if (!arbitraryItem || arbitraryItem[0].planner_id !== plannerId) {
          throw new NotFoundException()
        }
        await this.plannerRepository.deleteArbitraryPlannerItem(arbitraryItem[0])
        break
      }
      default: {
        throw new BadRequestException('Wrong field \'item_type\' in request data')
      }
    }

    const planner = await this.plannerRepository.getPlannerById(user, plannerId)

    if (!planner) {
      throw new NotFoundException()
    }

    return toJsonPlannerDetails(planner)
  }

  @Transactional()
  async createFuturePlannerItem(
    plannerId: number,
    year: number,
    semester: number,
    courseId: number,
  ): Promise<IPlanner.IItem.Future> {
    const planner = await this.plannerRepository.checkPlannerExists(plannerId)
    if (!planner) {
      throw new HttpException('Planner Doesn\'t exist', HttpStatus.NOT_FOUND)
    }

    const course = await this.courseRepository.getCourseById(courseId)
    if (!course) {
      throw new HttpException('Wrong field \'course\' in request data', HttpStatus.BAD_REQUEST)
    }
    const item: EPlanners.EItems.Future.Extended = await this.plannerRepository.createPlannerItem(
      plannerId,
      year,
      semester,
      courseId,
    )
    return toJsonFutureItem(item)
  }

  @Transactional()
  public async reorderPlanner(plannerId: number, order: number, user: session_userprofile): Promise<IPlanner.Response> {
    const planner = await this.plannerRepository.getPlannerById(user, plannerId)

    if (!planner) {
      throw new NotFoundException()
    }

    const oldOrder = planner.arrange_order
    const relatedPlannerIds = (await this.plannerRepository.getRelatedPlanner(user)).map((p) => p.id)

    if (oldOrder < order) {
      await this.plannerRepository.decrementOrders(relatedPlannerIds, oldOrder + 1, order)
    }
    else if (oldOrder > order) {
      await this.plannerRepository.incrementOrders(relatedPlannerIds, order, oldOrder - 1)
    }

    const updated = await this.plannerRepository.updateOrder(plannerId, order)

    return toJsonPlanner(updated)
  }

  @Transactional()
  async updatePlannerItem(
    plannerId: number,
    updateItemDto: IPlanner.UpdateItemBodyDto,
  ): Promise<EPlanners.EItems.Taken.Details | EPlanners.EItems.Future.Extended | EPlanners.EItems.Arbitrary.Extended> {
    const planner = await this.plannerRepository.checkPlannerExists(plannerId)
    if (!planner) {
      throw new HttpException('Planner Doesn\'t exist', HttpStatus.NOT_FOUND)
    }
    const { item_type, item, ...updatedFields } = updateItemDto
    return await this.plannerRepository.updatePlannerItem(item_type, item, updatedFields)
  }

  @Transactional()
  async updateTakenLectures(user: session_userprofile, plannerId: number, start_year: number, end_year: number) {
    const notWritableSemester = await this.semesterRepository.getNotWritableSemester()
    const takenLectures = await this.userRepository.getTakenLecturesByYear(
      user.id,
      start_year,
      end_year,
      notWritableSemester,
    )
    const existedTakenItems = await this.plannerRepository.getTakenPlannerItemByLectures(
      plannerId,
      takenLectures.map((takenLecture) => takenLecture.lecture_id),
    )
    const needToAddTakenLectures = takenLectures.filter(
      (takenLecture) => !existedTakenItems.find((existedTakenItem) => existedTakenItem.lecture_id === takenLecture.lecture_id),
    )
    await this.plannerRepository.createTakenPlannerItem(
      plannerId,
      needToAddTakenLectures.map((lecture) => ({ lectureId: lecture.lecture_id, isExcluded: false })),
    )
    await this.plannerRepository.deleteFuturePlannerItemsWithWhere(plannerId, start_year, end_year)
    await this.plannerRepository.deleteArbitraryPlannerItemsWithWhere(plannerId, start_year, end_year)
    await this.plannerRepository.deleteTakenPlannerItemsWithWhere(plannerId, {
      year: {
        lte: start_year,
        gte: end_year,
      },
    })
  }

  @Transactional()
  async updatePlanner(plannerId: number, plannerDto: IPlanner.UpdateBodyDto, user: session_userprofile) {
    const planner = this.plannerRepository.getPlannerById(user, plannerId)
    if (!planner) {
      throw new NotFoundException()
    }
    const updateFields = {
      start_year: plannerDto.start_year,
      end_year: plannerDto.end_year,
      general_track_id: plannerDto.general_track,
      major_track_id: plannerDto.major_track,
      additional_track_ids: plannerDto.additional_tracks ?? [],
    }
    return await this.plannerRepository.updatePlanner(plannerId, updateFields)
  }

  @Transactional()
  async deletePlanner(plannerId: number) {
    await this.plannerRepository.deletePlanner(plannerId)
  }
}
