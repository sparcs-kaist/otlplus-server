import { Injectable } from '@nestjs/common';
import {
  Prisma,
  session_userprofile,
  session_userprofile_taken_lectures,
} from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { SemesterRepository } from './semester.repository';

@Injectable()
export class UserRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly semesterRepository: SemesterRepository,
  ) {}

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

  async getReviewWritableTakenLectures(
    userId: number,
  ): Promise<session_userprofile_taken_lectures[]> {
    const notWritableSemester =
      await this.semesterRepository.getNotWritableSemester();

    return await this.prisma.session_userprofile_taken_lectures.findMany({
      where: {
        userprofile_id: userId,
        lecture: {
          AND: [
            {
              year: { not: notWritableSemester?.year },
            },
            { semester: { not: notWritableSemester?.semester } },
          ],
        },
      },
    });
  }
}
