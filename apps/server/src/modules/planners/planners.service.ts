import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { session_userprofile } from '@prisma/client';
import { IPlanner } from '@otl/api-interface/src/interfaces/IPlanner';

import { DepartmentRepository } from '@src/prisma/repositories/department.repository';
import { LectureRepository } from '@src/prisma/repositories/lecture.repository';
import { PlannerRepository } from '@src/prisma/repositories/planner.repository';
import { CourseRepository } from '../../prisma/repositories/course.repository';
import { Transactional } from '@nestjs-cls/transactional';
import { SemesterRepository } from '@src/prisma/repositories/semester.repository';
import { UserRepository } from '@src/prisma/repositories/user.repository';
import { toJsonPlanner } from '@src/common/serializer/planner.serializer';
import { toJsonArbitraryItem, toJsonFutureItem } from '@src/common/serializer/planner.item.serializer';
import { EPlanners } from '@otl/api-interface/src/entities/EPlanners';

@Injectable()
export class PlannersService {
  constructor(
    private readonly PlannerRepository: PlannerRepository,
    private readonly LectureRepository: LectureRepository,
    private readonly DepartmentRepository: DepartmentRepository,
    private readonly CourseRepository: CourseRepository,
    private readonly SemesterRepository: SemesterRepository,
    private readonly UserRepository: UserRepository,
  ) {}

  public async getPlannerByUser(query: IPlanner.QueryDto, user: session_userprofile) {
    const queryResult = await this.PlannerRepository.getPlannerByUser(query, user);
    return queryResult.map(toJsonPlanner);
  }

  async getRelatedPlanner(user: session_userprofile) {
    return await this.PlannerRepository.getRelatedPlanner(user);
  }

  @Transactional()
  public async postPlanner(body: IPlanner.CreateBodyDto, user: session_userprofile): Promise<IPlanner.Detail> {
    const relatedPlanner = await this.getRelatedPlanner(user);
    const arrangeOrder = relatedPlanner.length == 0 ? 0 : relatedPlanner[relatedPlanner.length - 1].arrange_order + 1;
    const planner = await this.PlannerRepository.createPlanner(body, arrangeOrder, user);

    if (body.should_update_taken_semesters) {
      const takenLectures = await this.LectureRepository.findReviewWritableLectures(user, new Date());
      const valid_takenLectures = takenLectures.filter((lecture) => {
        const validStartYear = lecture.year >= body.start_year;
        const validEndYear = lecture.year <= body.end_year;
        return validStartYear && validEndYear;
      });
      await this.PlannerRepository.createTakenPlannerItem(
        planner.id,
        valid_takenLectures.map((lecture) => {
          return { lectureId: lecture.id, isExcluded: false };
        }),
      );
    }

    const takenTargetItems = await this.PlannerRepository.getTakenPlannerItemByIds(body.taken_items_to_copy);
    await this.PlannerRepository.createTakenPlannerItem(
      planner.id,
      takenTargetItems?.map((item) => {
        return { lectureId: item.lecture_id, isExcluded: item.is_excluded };
      }) || [],
    );

    const futureTargetItems = await this.PlannerRepository.getFuturePlannerItemById(body.future_items_to_copy);
    await this.PlannerRepository.createFuturePlannerItem(planner.id, futureTargetItems || []);

    const targetItems = await this.PlannerRepository.getArbitraryPlannerItemById(body.arbitrary_items_to_copy);
    await this.PlannerRepository.createArbitraryPlannerItem(planner.id, targetItems || []);

    const newPlanner = await this.PlannerRepository.getPlannerById(user, planner.id);
    if (!newPlanner) {
      throw new NotFoundException();
    }

    return toJsonPlanner(newPlanner);
  }

  @Transactional()
  async addArbitraryItem(
    plannerId: number,
    body: IPlanner.AddArbitraryItemDto,
    user: session_userprofile,
  ): Promise<IPlanner.IItem.Arbitrary> {
    const planner = await this.PlannerRepository.getBasicPlannerById(plannerId);
    if (!planner) throw new NotFoundException();
    if (planner.user_id !== user.id) throw new UnauthorizedException();

    const department = await this.DepartmentRepository.getBasicDepartmentById(body.department);

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
    };

    const arbitraryItem = await this.PlannerRepository.createArbitraryPlannerItem(planner.id, data);
    return toJsonArbitraryItem(arbitraryItem);
  }

  @Transactional()
  public async removePlannerItem(
    plannerId: number,
    removeItem: IPlanner.RemoveItemBodyDto,
    user: session_userprofile,
  ): Promise<IPlanner.Detail> {
    switch (removeItem.item_type) {
      case 'TAKEN':
        throw new BadRequestException('Planner item with type "taken" can\'t be deleted');
      case 'FUTURE': {
        const futureItem = await this.PlannerRepository.getFuturePlannerItemById([removeItem.item]);
        if (!futureItem || futureItem[0].planner_id !== plannerId) {
          throw new NotFoundException();
        }
        await this.PlannerRepository.deleteFuturePlannerItem(futureItem[0]);
        break;
      }
      case 'ARBITRARY': {
        const arbitraryItem = await this.PlannerRepository.getArbitraryPlannerItemById([removeItem.item]);
        if (!arbitraryItem || arbitraryItem[0].planner_id !== plannerId) {
          throw new NotFoundException();
        }
        await this.PlannerRepository.deleteArbitraryPlannerItem(arbitraryItem[0]);
        break;
      }
    }

    const planner = await this.PlannerRepository.getPlannerById(user, plannerId);

    if (!planner) {
      throw new NotFoundException();
    }

    return toJsonPlanner(planner);
  }

  @Transactional()
  async createFuturePlannerItem(
    plannerId: number,
    year: number,
    semester: number,
    courseId: number,
  ): Promise<IPlanner.IItem.Future> {
    const planner = await this.PlannerRepository.checkPlannerExists(plannerId);
    if (!planner) {
      throw new HttpException("Planner Doesn't exist", HttpStatus.NOT_FOUND);
    }

    const course = await this.CourseRepository.getCourseById(courseId);
    if (!course) {
      throw new HttpException("Wrong field 'course' in request data", HttpStatus.BAD_REQUEST);
    }
    const item: EPlanners.EItems.Future.Extended = await this.PlannerRepository.createPlannerItem(
      plannerId,
      year,
      semester,
      courseId,
    );
    return toJsonFutureItem(item);
  }

  @Transactional()
  public async reorderPlanner(plannerId: number, order: number, user: session_userprofile): Promise<IPlanner.Detail> {
    const planner = await this.PlannerRepository.getPlannerById(user, plannerId);

    if (!planner) {
      throw new NotFoundException();
    }

    const oldOrder = planner.arrange_order;
    const relatedPlannerIds = (await this.PlannerRepository.getRelatedPlanner(user)).map((planner) => planner.id);

    if (oldOrder < order) {
      await this.PlannerRepository.decrementOrders(relatedPlannerIds, oldOrder + 1, order);
    } else if (oldOrder > order) {
      await this.PlannerRepository.incrementOrders(relatedPlannerIds, order, oldOrder - 1);
    }

    const updated = await this.PlannerRepository.updateOrder(plannerId, order);

    return toJsonPlanner(updated);
  }

  @Transactional()
  async updatePlannerItem(
    plannerId: number,
    updateItemDto: IPlanner.UpdateItemBodyDto,
  ): Promise<EPlanners.EItems.Taken.Details | EPlanners.EItems.Future.Extended | EPlanners.EItems.Arbitrary.Extended> {
    const planner = await this.PlannerRepository.checkPlannerExists(plannerId);
    if (!planner) {
      throw new HttpException("Planner Doesn't exist", HttpStatus.NOT_FOUND);
    }
    const { item_type, item, ...updatedFields } = updateItemDto;
    return await this.PlannerRepository.updatePlannerItem(item_type, item, updatedFields);
  }

  @Transactional()
  async updateTakenLectures(user: session_userprofile, plannerId: number, start_year: number, end_year: number) {
    const notWritableSemester = await this.SemesterRepository.getNotWritableSemester();
    const takenLectures = await this.UserRepository.getTakenLecturesByYear(
      user.id,
      start_year,
      end_year,
      notWritableSemester,
    );
    const existedTakenItems = await this.PlannerRepository.getTakenPlannerItemByLectures(
      plannerId,
      takenLectures.map((takenLecture) => takenLecture.lecture_id),
    );
    const needToAddTakenLectures = takenLectures.filter(
      (takenLecture) =>
        !existedTakenItems.find((existedTakenItem) => existedTakenItem.lecture_id === takenLecture.lecture_id),
    );
    await this.PlannerRepository.createTakenPlannerItem(
      plannerId,
      needToAddTakenLectures.map((lecture) => {
        return { lectureId: lecture.lecture_id, isExcluded: false };
      }),
    );
    await this.PlannerRepository.deleteFuturePlannerItemsWithWhere(plannerId, start_year, end_year);
    await this.PlannerRepository.deleteArbitraryPlannerItemsWithWhere(plannerId, start_year, end_year);
    await this.PlannerRepository.deleteTakenPlannerItemsWithWhere(plannerId, {
      year: {
        lte: start_year,
        gte: end_year,
      },
    });
  }

  @Transactional()
  async updatePlanner(plannerId: number, plannerDto: IPlanner.UpdateBodyDto, user: session_userprofile) {
    const planner = this.PlannerRepository.getPlannerById(user, plannerId);
    if (!planner) {
      throw new NotFoundException();
    }
    const updateFields = {
      start_year: plannerDto.start_year,
      end_year: plannerDto.end_year,
      general_track_id: plannerDto.general_track,
      major_track_id: plannerDto.major_track,
      additional_track_ids: plannerDto.additional_tracks ?? [],
    };
    return await this.PlannerRepository.updatePlanner(plannerId, updateFields);
  }

  @Transactional()
  async deletePlanner(plannerId: number) {
    await this.PlannerRepository.deletePlanner(plannerId);
  }
}
