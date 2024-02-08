import { Injectable } from '@nestjs/common';
import { session_userprofile, subject_department } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DepartmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getDepartmentOfUser(
    user: session_userprofile,
  ): Promise<subject_department | null> {
    const departmentId = user.department_id;
    if (!departmentId) {
      return null;
    }

    return this.prisma.subject_department.findUnique({
      where: { id: departmentId },
    });
  }

  async getFavoriteDepartments(
    user: session_userprofile,
  ): Promise<subject_department[]> {
    const favoriteDepartments = (
      await this.prisma.session_userprofile_favorite_departments.findMany({
        where: { userprofile_id: user.id },
        include: {
          department: true,
        },
      })
    ).map((favoriteDepartment) => favoriteDepartment.department);
    return favoriteDepartments;
  }

  async getMajors(user: session_userprofile): Promise<subject_department[]> {
    const majors = (
      await this.prisma.session_userprofile_majors.findMany({
        where: { userprofile_id: user.id },
        include: {
          subject_department: true,
        },
      })
    ).map((major) => major.subject_department);
    return majors;
  }

  async getMinors(user: session_userprofile): Promise<subject_department[]> {
    const minors = (
      await this.prisma.session_userprofile_minors.findMany({
        where: { userprofile_id: user.id },
        include: {
          subject_department: true,
        },
      })
    ).map((minor) => minor.subject_department);
    return minors;
  }

  async getSpecializedMajors(
    user: session_userprofile,
  ): Promise<subject_department[]> {
    const specializedMajors = (
      await this.prisma.session_userprofile_specialized_major.findMany({
        where: { userprofile_id: user.id },
        include: {
          subject_department: true,
        },
      })
    ).map((specializedMajor) => specializedMajor.subject_department);
    return specializedMajors;
  }

  async getAllDepartmentOptions(
    excludedDepartmentCodes: string[],
  ): Promise<subject_department[]> {
    return this.prisma.subject_department.findMany({
      where: {
        visible: true,
        code: { notIn: excludedDepartmentCodes },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getDepartmentCodesOfRecentLectures(
    yearThreshold: number,
  ): Promise<string[]> {
    const res = (await this.prisma.$queryRaw`
      SELECT DISTINCT d.code
      FROM subject_lecture l
      JOIN subject_department d on l.department_id = d.id 
      WHERE l.year >= ${yearThreshold};`) as { code: string }[];
    return res.map((e) => e.code);
  }
}
