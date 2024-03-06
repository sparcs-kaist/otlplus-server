import { Injectable } from '@nestjs/common';
import { session_userprofile } from '@prisma/client';
import {
  PlannerBodyDto,
  PlannerQueryDto,
  PlannerUpdateItemDto,
} from 'src/common/interfaces/dto/planner/planner.request.dto';
import { PlannerResponseDto } from 'src/common/interfaces/dto/planner/planner.response.dto';
import { toJsonPlanner } from 'src/common/interfaces/serializer/planner.serializer';
import { LectureRepository } from 'src/prisma/repositories/lecture.repository';
import { PlannerRepository } from 'src/prisma/repositories/planner.repository';

@Injectable()
export class PlannersService {
  constructor(
    private readonly plannerRepository: PlannerRepository,
    private readonly lectureRepository: LectureRepository,
  ) {}

  public async getPlannerByUser(
    query: PlannerQueryDto,
    user: session_userprofile,
  ) {
    const queryResult = await this.plannerRepository.getPlannerByUser(
      query,
      user,
    );
    return queryResult.map(toJsonPlanner);
  }

  async getRelatedPlanner(user: session_userprofile) {
    return await this.plannerRepository.getRelatedPlanner(user);
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
    const planner = await this.plannerRepository.createPlanner(
      body,
      arrangeOrder,
      user,
    );

    if (body.should_update_taken_semesters) {
      const takenLectures =
        await this.lectureRepository.findReviewWritableLectures(
          user,
          new Date(),
        );
      const valid_takenLectures = takenLectures.filter((lecture) => {
        const validStartYear = lecture.year >= body.start_year;
        const validEndYear = lecture.year <= body.end_year;
        return validStartYear && validEndYear;
      });
      valid_takenLectures.forEach(async (lecture) => {
        await this.plannerRepository.createTakenPlannerItem(planner, lecture);
      });
    }

    body.taken_items_to_copy.forEach(async (item) => {
      const targetItem = await this.plannerRepository.getTakenPlannerItemById(
        user,
        item,
      );
      await this.plannerRepository.createTakenPlannerItem(
        planner,
        targetItem.subject_lecture,
        targetItem.is_excluded,
      );
    });

    body.future_items_to_copy.forEach(async (item) => {
      const targetItem = await this.plannerRepository.getFuturePlannerItemById(
        user,
        item,
      );
      await this.plannerRepository.createFuturePlannerItem(planner, targetItem);
    });

    body.arbitrary_items_to_copy.forEach(async (item) => {
      const targetItem =
        await this.plannerRepository.getArbitraryPlannerItemById(user, item);
      await this.plannerRepository.createArbitraryPlannerItem(
        planner,
        targetItem,
      );
    });

    return toJsonPlanner(planner);
  }

  async updatePlannerItem(
    plannerId: number,
    updateItemDto: PlannerUpdateItemDto,
  ) {
    return null;
  }
}
