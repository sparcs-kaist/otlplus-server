import { BadRequestException, Injectable } from '@nestjs/common';
import { session_userprofile } from '@prisma/client';
import {
  PlannerBodyDto,
  PlannerQueryDto,
} from 'src/common/interfaces/dto/planner/planner.request.dto';
import { PlannerResponseDto } from 'src/common/interfaces/dto/planner/planner.response.dto';
import { toJsonPlanner } from 'src/common/interfaces/serializer/planner.serializer';
import { LectureRepository } from 'src/prisma/repositories/lecture.repository';
import { PlannerRepository } from 'src/prisma/repositories/planner.repository';

@Injectable()
export class PlannersService {
  constructor(
    private readonly PlannerRepository: PlannerRepository,
    private readonly LectureRepository: LectureRepository,
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
    const arrange_order =
      relatedPlanner.length == 0
        ? 0
        : relatedPlanner[relatedPlanner.length - 1].arrange_order + 1;
    const planner = await this.PlannerRepository.createPlanner(
      body,
      arrange_order,
      user,
    );

    if (body.should_update_taken_semesters) {
      const taken_lectures =
        await this.LectureRepository.findReviewWritableLectures(
          user,
          new Date(),
        );
      const valid_taken_lectures = taken_lectures.filter((lecture) => {
        const valid_start_year = lecture.year >= body.start_year;
        const valid_end_year = lecture.year <= body.end_year;
        return valid_start_year && valid_end_year;
      });
      valid_taken_lectures.forEach(async (lecture) => {
        await this.PlannerRepository.createTakenPlannerItem(planner, lecture);
      });
    }

    body.taken_items_to_copy.forEach(async (item) => {
      const target_items = await this.PlannerRepository.getTakenPlannerItemById(
        user,
        item,
      );
      if (target_items.length == 0) {
        throw new BadRequestException('No such planner item');
      } else {
        const target_item = target_items[0];
        await this.PlannerRepository.createTakenPlannerItem(
          planner,
          target_item.subject_lecture,
          target_item.is_excluded,
        );
      }
    });

    body.future_items_to_copy.forEach(async (item) => {
      const target_items =
        await this.PlannerRepository.getFuturePlannerItemById(user, item);
      if (target_items.length == 0) {
        throw new BadRequestException('No such planner item');
      } else {
        const target_item = target_items[0];
        await this.PlannerRepository.createFuturePlannerItem(
          planner,
          target_item,
        );
      }
    });

    body.arbitrary_items_to_copy.forEach(async (item) => {
      const target_items =
        await this.PlannerRepository.getArbitraryPlannerItemById(user, item);
      if (target_items.length == 0) {
        throw new BadRequestException('No such planner item');
      } else {
        const target_item = target_items[0];
        await this.PlannerRepository.createArbitraryPlannerItem(
          planner,
          target_item,
        );
      }
    });

    return toJsonPlanner(planner);
  }
}
