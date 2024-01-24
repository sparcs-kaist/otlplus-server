import { Injectable } from '@nestjs/common';
import { session_userprofile } from '@prisma/client';
import { PlannerRequestDtoDefault } from 'src/common/interfaces/dto/planner/planner.request.dto';
import { PlannerRepository } from 'src/prisma/repositories/planner.repository';

@Injectable()
export class PlannersService {
  constructor(private readonly plannerRepository: PlannerRepository) {}

  public async getPlannerByUser(
    query: PlannerRequestDtoDefault,
    user: session_userprofile,
  ) {
    return await this.plannerRepository.getPlannerByUser(query, user);
  }
}
