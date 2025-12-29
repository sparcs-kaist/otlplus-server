import { BadRequestException, Injectable } from '@nestjs/common'
import { Prisma, session_userprofile, subject_semester } from '@prisma/client'

import { PrismaReadService } from '@otl/prisma-client/prisma.read.service'

import { EUser } from '../entities/EUser'
import { PrismaService } from '../prisma.service'

@Injectable()
export class UserRepositoryV2 {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaRead: PrismaReadService,
  ) {}

  async findBySid(sid: string): Promise<session_userprofile | null> {
    return this.prisma.session_userprofile.findFirst({
      where: { sid },
    })
  }

  async findByUid(uid: string): Promise<session_userprofile | null> {
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

  async updateInterestedDepartments(user: session_userprofile, departments: number[]): Promise<void> {
    // 0) 입력을 숫자 배열로 강제 변환(문자 섞여온 케이스 방지)
    const normalized = (departments ?? []).map((v) => Number(v)).filter((v) => Number.isInteger(v))
    // 1) 중복 제거
    const ids = Array.from(new Set(normalized))
    // 2) 존재 검증: 하나라도 없으면 400
    if (ids.length > 0) {
      const existing = await this.prismaRead.subject_department.findMany({
        where: { id: { in: ids } },
        select: { id: true },
      })
      const existingSet = new Set(existing.map((d) => d.id))
      const invalid = ids.filter((id) => !existingSet.has(id))
      if (invalid.length > 0) {
        throw new BadRequestException(`invalid Departments: ${invalid.join(', ')}`)
      }
    }
    // 3) 트랜잭션: 전량 삭제 → 벌크 삽입
    await this.prisma.$transaction(async (tx) => {
      await tx.session_userprofile_favorite_departments.deleteMany({
        where: { userprofile_id: user.id },
      })
      if (ids.length > 0) {
        await tx.session_userprofile_favorite_departments.createMany({
          data: ids.map((department_id) => ({
            userprofile_id: user.id,
            department_id,
          })),
          skipDuplicates: true,
        })
      }
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

  findByStudentId(studentId: number): Promise<session_userprofile | null> {
    return this.prismaRead.session_userprofile.findFirst({
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
}
