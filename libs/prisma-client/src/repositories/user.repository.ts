import { Injectable } from '@nestjs/common'
import { Prisma, session_userprofile, subject_semester } from '@prisma/client'

import { PrismaReadService } from '@otl/prisma-client/prisma.read.service'

import { EUser } from '../entities/EUser'
import { PrismaService } from '../prisma.service'

@Injectable()
export class UserRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaRead: PrismaReadService,
  ) {}

  async findBySid(sid: string) {
    return this.prisma.session_userprofile.findFirst({
      where: { sid },
    })
  }

  async createUser(user: Prisma.session_userprofileCreateInput): Promise<session_userprofile> {
    return this.prisma.session_userprofile.create({
      data: user,
    })
  }

  async updateUser(userId: number, data: any): Promise<session_userprofile> {
    return this.prisma.session_userprofile.update({
      where: { id: userId },
      data,
    })
  }

  async changeFavoriteDepartments(userId: number, departmentIds: number[]): Promise<EUser.Basic> {
    await this.prisma.session_userprofile_favorite_departments.deleteMany({
      where: { userprofile_id: userId },
    })
    return this.prisma.session_userprofile.update({
      where: { id: userId },
      data: {
        favorite_departments: {
          create: departmentIds.map((department_id) => ({ department_id })),
        },
      },
    })
  }

  async getTakenLectures(userId: number, notWritableSemester?: subject_semester | null) {
    return await this.prismaRead.session_userprofile_taken_lectures.findMany({
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
    })
  }

  async getTakenLecturesByYear(
    userId: number,
    from: number,
    to: number,
    notWritableSemester?: subject_semester | null,
  ) {
    const reviewWritableLecture = await this.getTakenLectures(userId, notWritableSemester)
    return reviewWritableLecture.filter(
      (takenLecture) => takenLecture.lecture.year >= from && takenLecture.lecture.year <= to,
    )
  }

  findByStudentId(studentId: number) {
    return this.prismaRead.session_userprofile.findFirst({
      where: {
        student_id: studentId.toString(),
      },
    })
  }
}
