import { Injectable } from '@nestjs/common';
import { Prisma, session_userprofile } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findBySid(sid: string) {
    return await this.prisma.session_userprofile.findFirst({
      where: { sid: sid },
    });
  }

  async createUser(
    user: Prisma.session_userprofileCreateInput,
  ): Promise<session_userprofile> {
    return await this.prisma.session_userprofile.create({
      data: user,
    });
  }

  async updateUser(
    userId: number,
    user: Prisma.session_userprofileUpdateInput,
  ): Promise<session_userprofile> {
    return await this.prisma.session_userprofile.update({
      data: user,
      where: { id: userId },
    });
  }

  async changeFavoriteDepartments(userId: number, departmentIds: number[]) {
    await this.prisma.session_userprofile_favorite_departments.deleteMany({
      where: { userprofile_id: userId },
    });
    return await this.prisma.session_userprofile.update({
      where: { id: userId },
      data: {
        favorite_departments: {
          create: departmentIds.map((department_id) => ({ department_id })),
        },
      },
    });
  }
}
