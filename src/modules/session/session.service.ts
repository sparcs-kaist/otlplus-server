import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/prisma/repositories/user.repository';

@Injectable()
export class SessionService {
  constructor(private readonly userRepository: UserRepository) {}

  async changeFavoriteDepartments(userId: number, departmentIds: number[]) {
    return await this.userRepository.changeFavoriteDepartments(
      userId,
      departmentIds,
    );
  }
}
