import { BadRequestException, Injectable } from '@nestjs/common'
import { session_userprofile, subject_department } from '@prisma/client'

import { PrismaReadService } from '@otl/prisma-client/prisma.read.service'
import { PrismaService } from '@otl/prisma-client/prisma.service'

@Injectable()
export class DepartmentRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaRead: PrismaReadService,
  ) {}

  async getBasicDepartmentById(id: number): Promise<subject_department | null> {
    return this.prisma.subject_department.findUnique({
      where: { id },
    })
  }

  async getDepartmentOfUser(user: session_userprofile): Promise<subject_department | null> {
    const departmentId = user.department_id
    if (!departmentId) {
      return null
    }

    return this.prismaRead.subject_department.findUnique({
      where: { id: departmentId },
    })
  }

  async getFavoriteDepartments(user: session_userprofile): Promise<subject_department[]> {
    const favoriteDepartments = (
      await this.prismaRead.session_userprofile_favorite_departments.findMany({
        where: { userprofile_id: user.id },
        include: {
          department: true,
        },
      })
    ).map((favoriteDepartment) => favoriteDepartment.department)
    return favoriteDepartments
  }

  async v2updateInerestedMajorDepartments(user: session_userprofile, newIds: number[]): Promise<void> {
    const distinctIds = Array.from(new Set(newIds))

    const existing = await this.prisma.subject_department.findMany({
      where: { id: { in: distinctIds } },
      select: { id: true },
    })
    const existingIds = new Set(existing.map((d) => d.id))

    const invalidIds = distinctIds.filter((id) => !existingIds.has(id))
    if (invalidIds.length > 0) {
      throw new BadRequestException(`Invalid department_id(s): ${invalidIds.join(', ')}`)
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.session_userprofile_favorite_departments.deleteMany({
        where: { userprofile_id: user.id },
      })
      await tx.session_userprofile_favorite_departments.createMany({
        data: newIds.map((department_id) => ({
          userprofile_id: user.id,
          department_id,
        })),
      })
    })
  }

  async getMajors(user: session_userprofile): Promise<subject_department[]> {
    const majors = (
      await this.prismaRead.session_userprofile_majors.findMany({
        where: { userprofile_id: user.id },
        include: {
          subject_department: true,
        },
      })
    ).map((major) => major.subject_department)
    return majors
  }

  async getMinors(user: session_userprofile): Promise<subject_department[]> {
    const minors = (
      await this.prismaRead.session_userprofile_minors.findMany({
        where: { userprofile_id: user.id },
        include: {
          subject_department: true,
        },
      })
    ).map((minor) => minor.subject_department)
    return minors
  }

  async getSpecializedMajors(user: session_userprofile): Promise<subject_department[]> {
    const specializedMajors = (
      await this.prismaRead.session_userprofile_specialized_major.findMany({
        where: { userprofile_id: user.id },
        include: {
          subject_department: true,
        },
      })
    ).map((specializedMajor) => specializedMajor.subject_department)
    return specializedMajors
  }

  async getAllDepartmentOptions(excludedDepartmentCodes: string[]): Promise<subject_department[]> {
    return this.prismaRead.subject_department.findMany({
      where: {
        visible: true,
        code: { notIn: excludedDepartmentCodes },
      },
      orderBy: { name: 'asc' },
    })
  }

  async getDepartmentCodesOfRecentLectures(yearThreshold: number): Promise<string[]> {
    const res = await this.prismaRead.subject_department.findMany({
      where: {
        subject_lecture: {
          some: {
            year: { gte: yearThreshold },
          },
        },
      },
      select: {
        code: true,
      },
    })
    return res.map((e) => e.code)
  }

  async getRelatedDepartments(user: session_userprofile): Promise<subject_department[]> {
    const departments: subject_department[] = (
      await Promise.all([
        this.getDepartmentOfUser(user),
        this.getMajors(user),
        this.getMinors(user),
        this.getSpecializedMajors(user),
        this.getFavoriteDepartments(user),
      ])
    ).flatMap(
      (deps: subject_department | subject_department[] | null): subject_department | subject_department[] => deps ?? [],
    )
    const uniqueDepartments: subject_department[] = departments.filter(
      (dep, index, deps) => deps.findIndex((d) => d.id === dep.id) === index,
    )
    return uniqueDepartments
  }
}
