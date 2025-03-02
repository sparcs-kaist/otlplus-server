import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/prisma/repositories/user.repository';
import { Transactional } from '@nestjs-cls/transactional';

@Injectable()
export class SessionService {
  constructor(private readonly userRepository: UserRepository) {}

  @Transactional()
  async changeFavoriteDepartments(userId: number, departmentIds: number[]) {
    return this.userRepository.changeFavoriteDepartments(userId, departmentIds);
  }
}
