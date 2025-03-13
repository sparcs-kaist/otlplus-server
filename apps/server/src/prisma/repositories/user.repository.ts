import { Injectable, NotFoundException } from '@nestjs/common';
import { EUser } from '@otl/api-interface/src/entities/EUser';
import { Prisma, subject_semester } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findBySid(sid: string): Promise<EUser.Basic> {
    const user = await this.prisma.session_userprofile.findFirst({
      where: { sid: sid },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      ...user,
      name_kor: user.name_kor ?? user.first_name + ' ' + user.last_name,
      name_eng: user.name_eng ?? user.first_name + ' ' + user.last_name,
    };
  }

  async createUser(user: Prisma.session_userprofileCreateInput): Promise<EUser.Basic> {
    const createdUser = await this.prisma.session_userprofile.create({
      data: user,
    });
    return {
      ...createdUser,
      name_kor: createdUser.name_kor ?? createdUser.first_name + ' ' + createdUser.last_name,
      name_eng: createdUser.name_eng ?? createdUser.first_name + ' ' + createdUser.last_name,
    };
  }

  async updateUser(userId: number, user: Prisma.session_userprofileUpdateInput): Promise<EUser.Basic> {
    const updatedUser = await this.prisma.session_userprofile.update({
      data: user,
      where: { id: userId },
    });
    return {
      ...updatedUser,
      name_kor: updatedUser.name_kor ?? updatedUser.first_name + ' ' + updatedUser.last_name,
      name_eng: updatedUser.name_eng ?? updatedUser.first_name + ' ' + updatedUser.last_name,
    };
  }

  async changeFavoriteDepartments(userId: number, departmentIds: number[]): Promise<EUser.Basic> {
    await this.prisma.session_userprofile_favorite_departments.deleteMany({
      where: { userprofile_id: userId },
    });
    const user = await this.prisma.session_userprofile.update({
      where: { id: userId },
      data: {
        favorite_departments: {
          create: departmentIds.map((department_id) => ({ department_id })),
        },
      },
    });
    return {
      ...user,
      name_kor: user.name_kor ?? user.first_name + ' ' + user.last_name,
      name_eng: user.name_eng ?? user.first_name + ' ' + user.last_name,
    };
  }

  async getTakenLectures(userId: number, notWritableSemester?: subject_semester | null) {
    return await this.prisma.session_userprofile_taken_lectures.findMany({
      include: { lecture: true },
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

  async getTakenLecturesByYear(
    userId: number,
    from: number,
    to: number,
    notWritableSemester?: subject_semester | null,
  ) {
    const reviewWritableLecture = await this.getTakenLectures(userId, notWritableSemester);
    return reviewWritableLecture.filter(
      (takenLecture) => takenLecture.lecture.year >= from && takenLecture.lecture.year <= to,
    );
  }

  async findByUserId(userId: number): Promise<EUser.Basic> {
    const user = await this.prisma.session_userprofile.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      ...user,
      name_kor: user.name_kor ?? user.first_name + ' ' + user.last_name,
      name_eng: user.name_eng ?? user.first_name + ' ' + user.last_name,
    };
  }
}
