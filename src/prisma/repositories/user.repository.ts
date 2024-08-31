import { Injectable } from '@nestjs/common';
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

  async findBySessionKey(sessionKey: string) {
    const djangoSession = await this.prisma.django_session.findFirstOrThrow({
      where: {
        session_key: sessionKey,
      },
    });
    const decodedSessionData = Buffer.from(
      djangoSession.session_data,
      'base64',
    ).toString('utf8');
    const sessionData_obj = JSON.parse(decodedSessionData);
    const userId = sessionData_obj['_auth_user_id'];
    const user = await this.prisma.session_userprofile.findUnique({
      select: {
        id: true,
        user_id: true,
        student_id: true,
        sid: true,
        language: true,
        portal_check: true,
        department_id: true,
        email: true,
      },
      where: {
        user_id: userId,
      },
    });
    const auth_user = await this.prisma.auth_user.findUnique({
      select: {
        date_joined: true,
        first_name: true,
        last_name: true,
      },
      where: {
        id: userId,
      },
    });
    return {
      ...user,
      ...auth_user,
    };
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

  async getTakenLectures(
    userId: number,
    notWritableSemester?: subject_semester | null,
  ) {
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
}
