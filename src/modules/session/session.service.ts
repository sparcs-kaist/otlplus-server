import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/prisma/repositories/user.repository';
import { EUser } from '../../common/entities/EUser';

@Injectable()
export class SessionService {
  constructor(private readonly userRepository: UserRepository) {}

  async changeFavoriteDepartments(
    userId: number,
    departmentIds: number[],
  ): Promise<EUser.Basic> {
    return await this.userRepository.changeFavoriteDepartments(
      userId,
      departmentIds,
    );
  }
}
