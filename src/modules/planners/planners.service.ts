import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { session_userprofile } from '@prisma/client';
import { IPlanner } from 'src/common/interfaces/IPlanner';
import {
  PlannerBodyDto,
  PlannerQueryDto,
  PlannerUpdateItemDto,
  PlannerRemoveItemDto,
} from 'src/common/interfaces/dto/planner/planner.request.dto';
import { PlannerResponseDto } from 'src/common/interfaces/dto/planner/planner.response.dto';
import { FuturePlannerItemResponseDto } from 'src/common/interfaces/dto/planner_item/future.reponse.dto';
import { toJsonFutureItem } from 'src/common/interfaces/serializer/planner.item.serializer';
import { toJsonArbitraryItem } from 'src/common/interfaces/serializer/planner.item.serializer';
import { toJsonPlanner } from 'src/common/interfaces/serializer/planner.serializer';
import { FuturePlannerItem } from 'src/common/schemaTypes/types';
import { DepartmentRepository } from 'src/prisma/repositories/department.repository';
import { LectureRepository } from 'src/prisma/repositories/lecture.repository';
import { PlannerRepository } from 'src/prisma/repositories/planner.repository';
import { CourseRepository } from './../../prisma/repositories/course.repository';
import { EPlanners } from '../../common/entities/EPlanners';

@Injectable()
export class PlannersService {
  constructor(
    private readonly PlannerRepository: PlannerRepository,
    private readonly LectureRepository: LectureRepository,
    private readonly DepartmentRepository: DepartmentRepository,
    private readonly CourseRepository: CourseRepository,
  ) {}

  public async getPlannerByUser(
    query: PlannerQueryDto,
    user: session_userprofile,
  ) {
    const queryResult = await this.PlannerRepository.getPlannerByUser(
      query,
      user,
    );
    return queryResult.map(toJsonPlanner);
  }

  async getRelatedPlanner(user: session_userprofile) {
    return await this.PlannerRepository.getRelatedPlanner(user);
  }

  public async postPlanner(
    body: PlannerBodyDto,
    user: session_userprofile,
  ): Promise<PlannerResponseDto> {
    const relatedPlanner = await this.getRelatedPlanner(user);
    const arrangeOrder =
      relatedPlanner.length == 0
        ? 0
        : relatedPlanner[relatedPlanner.length - 1].arrange_order + 1;
    const planner = await this.PlannerRepository.createPlanner(
      body,
      arrangeOrder,
      user,
    );

    if (body.should_update_taken_semesters) {
      const takenLectures =
        await this.LectureRepository.findReviewWritableLectures(
          user,
          new Date(),
        );
      const valid_takenLectures = takenLectures.filter((lecture) => {
        const validStartYear = lecture.year >= body.start_year;
        const validEndYear = lecture.year <= body.end_year;
        return validStartYear && validEndYear;
      });
      valid_takenLectures.forEach(async (lecture) => {
        await this.PlannerRepository.createTakenPlannerItem(planner, lecture);
      });
    }

    body.taken_items_to_copy.forEach(async (item) => {
      const targetItem = await this.PlannerRepository.getTakenPlannerItemById(
        user,
        item,
      );
      if (!targetItem) {
        return; // ignore non-existing items during copy
      }
      await this.PlannerRepository.createTakenPlannerItem(
        planner,
        targetItem.subject_lecture,
        targetItem.is_excluded,
      );
    });

    body.future_items_to_copy.forEach(async (item) => {
      const targetItem = await this.PlannerRepository.getFuturePlannerItemById(
        user,
        item,
      );
      if (!targetItem) {
        return; // ignore non-existing items during copy
      }
      await this.PlannerRepository.createFuturePlannerItem(planner, targetItem);
    });

    body.arbitrary_items_to_copy.forEach(async (item) => {
      const targetItem =
        await this.PlannerRepository.getArbitraryPlannerItemById(user, item);
      if (!targetItem) {
        return; // ignore non-existing items during copy
      }
      await this.PlannerRepository.createArbitraryPlannerItem(
        planner,
        targetItem,
      );
    });

    return toJsonPlanner(planner);
  }

  async addArbitraryItem(
    plannerId: number,
    body: IPlanner.AddArbitraryItemDto,
    user: session_userprofile,
  ) {
    const planner = await this.PlannerRepository.getBasicPlannerById(plannerId);
    if (!planner) throw new NotFoundException();
    if (planner.user_id !== user.id) throw new UnauthorizedException();

    const department = await this.DepartmentRepository.getBasicDepartmentById(
      body.department,
    );

    const arbitraryItem =
      await this.PlannerRepository.createArbitraryPlannerItem(planner, {
        year: body.year,
        semester: body.semester,
        department_id: department?.id || null,
        type: body.type,
        type_en: body.type_en,
        credit: body.credit,
        credit_au: body.credit_au,
        is_excluded: false,
      });
    return toJsonArbitraryItem(arbitraryItem);
  }

  public async removePlannerItem(
    plannerId: number,
    removeItem: PlannerRemoveItemDto,
    user: session_userprofile,
  ): Promise<PlannerResponseDto> {
    switch (removeItem.item_type) {
      case 'TAKEN':
        throw new BadRequestException(
          'Planner item with type "taken" can\'t be deleted',
        );
      case 'FUTURE': {
        const futureItem =
          await this.PlannerRepository.getFuturePlannerItemById(
            user,
            removeItem.item,
          );
        if (!futureItem || futureItem.planner_id !== plannerId) {
          throw new NotFoundException();
        }
        await this.PlannerRepository.deleteFuturePlannerItem(futureItem);
        break;
      }
      case 'ARBITRARY': {
        const arbitraryItem =
          await this.PlannerRepository.getArbitraryPlannerItemById(
            user,
            removeItem.item,
          );
        if (!arbitraryItem || arbitraryItem.planner_id !== plannerId) {
          throw new NotFoundException();
        }
        await this.PlannerRepository.deleteArbitraryPlannerItem(arbitraryItem);
        break;
      }
    }

    const planner = await this.PlannerRepository.getPlannerById(
      user,
      plannerId,
    );

    if (!planner) {
      throw new NotFoundException();
    }

    return toJsonPlanner(planner);
  }

  async createFuturePlannerItem(
    plannerId: number,
    year: number,
    semester: number,
    courseId: number,
  ): Promise<FuturePlannerItemResponseDto> {
    const planner = await this.PlannerRepository.checkPlannerExists(plannerId);
    if (!planner) {
      throw new HttpException("Planner Doesn't exist", HttpStatus.NOT_FOUND);
    }

    const course = await this.CourseRepository.getCourseById(courseId);
    if (!course) {
      throw new HttpException(
        "Wrong field 'course' in request data",
        HttpStatus.BAD_REQUEST,
      );
    }
    const item: FuturePlannerItem =
      await this.PlannerRepository.createPlannerItem(
        plannerId,
        year,
        semester,
        courseId,
      );
    return toJsonFutureItem(item);
  }

  public async reorderPlanner(
    plannerId: number,
    order: number,
    user: session_userprofile,
  ): Promise<PlannerResponseDto> {
    const planner = await this.PlannerRepository.getPlannerById(
      user,
      plannerId,
    );

    if (!planner) {
      throw new NotFoundException();
    }

    const oldOrder = planner.arrange_order;
    const relatedPlannerIds = (
      await this.PlannerRepository.getRelatedPlanner(user)
    ).map((planner) => planner.id);

    if (oldOrder < order) {
      await this.PlannerRepository.decrementOrders(
        relatedPlannerIds,
        oldOrder + 1,
        order,
      );
    } else if (oldOrder > order) {
      await this.PlannerRepository.incrementOrders(
        relatedPlannerIds,
        order,
        oldOrder - 1,
      );
    }

    const updated = await this.PlannerRepository.updateOrder(plannerId, order);

    return toJsonPlanner(updated);
  }

  async updatePlannerItem(
    plannerId: number,
    updateItemDto: PlannerUpdateItemDto,
  ): Promise<
    | EPlanners.EItems.Taken.Details
    | EPlanners.EItems.Future.Extended
    | EPlanners.EItems.Arbitrary.Extended
  > {
    const planner = await this.PlannerRepository.getPlannerById(plannerId);

    const { item_type, item, ...updatedFields } = updateItemDto;
    return await this.PlannerRepository.updatePlannerItem(
      item_type,
      item,
      updatedFields,
    );
  }
}
