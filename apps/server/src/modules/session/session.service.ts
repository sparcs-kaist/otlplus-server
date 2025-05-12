import { Injectable } from '@nestjs/common'
import { Transactional } from '@nestjs-cls/transactional'

import { EUser } from '@otl/prisma-client/entities'
import { UserRepository } from '@otl/prisma-client/repositories'

@Injectable()
export class SessionService {
  constructor(private readonly userRepository: UserRepository) {}

  @Transactional()
  async changeFavoriteDepartments(userId: number, departmentIds: number[]): Promise<EUser.Basic> {
    return this.userRepository.changeFavoriteDepartments(userId, departmentIds)
  }
}
