import { Injectable, NotFoundException } from '@nestjs/common';
import { EUser } from '@otl/api-interface/src/entities/EUser';
import { Prisma, session_userprofile, subject_semester } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findBySid(sid: string) {
    return await this.prisma.session_userprofile.findFirst({
      where: { sid: sid },
    });
  }

  async createUser(user: Prisma.session_userprofileCreateInput): Promise<session_userprofile> {
    return await this.prisma.session_userprofile.create({
      data: user,
    });
  }

  async updateUser(userId: number, user: Prisma.session_userprofileUpdateInput): Promise<session_userprofile> {
    return await this.prisma.session_userprofile.update({
      data: user,
      where: { id: userId },
    });
  }

  async changeFavoriteDepartments(userId: number, departmentIds: number[]): Promise<EUser.Basic> {
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
    return user;
  }
}
