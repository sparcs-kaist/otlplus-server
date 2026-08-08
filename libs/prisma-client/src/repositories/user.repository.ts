import { Injectable } from '@nestjs/common'
import { Prisma, session_userprofile, subject_semester } from '@prisma/client'

import { EUser } from '../entities/EUser'
import { PrismaService } from '../prisma.service'

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findBySid(sid: string) {
    return this.prisma.session_userprofile.findFirst({
      where: { sid },
    })
  }

  async findByUid(uid: string) {
    return this.prisma.session_userprofile.findFirst({
      where: { uid },
    })
  }

  async createUser(user: Prisma.session_userprofileCreateInput): Promise<session_userprofile> {
    return this.prisma.session_userprofile.create({
      data: user,
    })
  }

  async updateUser(userId: number, data: Prisma.session_userprofileUpdateInput): Promise<session_userprofile> {
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
    return this.prisma.session_userprofile.findFirst({
      where: {
        student_id: studentId.toString(),
      },
    })
  }

  async findSidByUid(uid: string | null): Promise<string | null> {
    if (!uid) return null
    const map = await this.prisma.session_userprofile.findFirst({ where: { uid } })
    return map?.sid ?? null
  }

  // API Key methods
  async createApiKey(data: { userprofile_id: number; key: string; name: string | null; is_active: boolean }) {
    return this.prisma.session_api_key.create({
      data: {
        userprofile_id: data.userprofile_id,
        key: data.key,
        name: data.name,
        is_active: data.is_active,
      },
      select: {
        id: true,
        key: true,
        name: true,
        created_at: true,
      },
    })
  }

  async findApiKey(key: string) {
    return this.prisma.session_api_key.findUnique({
      where: { key },
      include: { userprofile: true },
    })
  }

  async updateApiKeyLastUsed(keyId: number) {
    return this.prisma.session_api_key.update({
      where: { id: keyId },
      data: { last_used_at: new Date() },
    })
  }

  async listApiKeys(userId: number) {
    return this.prisma.session_api_key.findMany({
      where: { userprofile_id: userId },
      select: {
        id: true,
        name: true,
        created_at: true,
        last_used_at: true,
        is_active: true,
      },
      orderBy: { created_at: 'desc' },
    })
  }

  async revokeApiKey(userId: number, keyId: number) {
    return this.prisma.session_api_key.updateMany({
      where: {
        id: keyId,
        userprofile_id: userId,
      },
      data: { is_active: false },
    })
  }

  async deleteApiKey(userId: number, keyId: number) {
    return this.prisma.session_api_key.deleteMany({
      where: {
        id: keyId,
        userprofile_id: userId,
      },
    })
  }
}
