import { Injectable } from '@nestjs/common';
import { UserRepository } from '@src/prisma/repositories/user.repository';
import { Transactional } from '@nestjs-cls/transactional';
import { EUser } from '@otl/api-interface/src/entities/EUser';

@Injectable()
export class SessionService {
  constructor(private readonly userRepository: UserRepository) {}

  @Transactional()
  async changeFavoriteDepartments(userId: number, departmentIds: number[]): Promise<EUser.Basic> {
    return this.userRepository.changeFavoriteDepartments(userId, departmentIds);
  }
}
