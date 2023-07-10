import { PrismaService } from "../prisma.service";
import { session_userprofile, subject_department } from "@prisma/client";
import session from "express-session";
import { Injectable } from "@nestjs/common";

@Injectable()
export class DepartmentRepository{
  constructor(private readonly prisma: PrismaService) {
  }

  async getDepartmentOfUser(user: session_userprofile): Promise<subject_department> {
    const departmentId = user.department_id
    if(!departmentId) return null;
    const department = await this.prisma.subject_department.findUnique({
      where: { id: departmentId }
    });
    return department;
  }

  async getFavoriteDepartments(user: session_userprofile): Promise<subject_department[]>{
    const favoriteDepartments = (await this.prisma.session_userprofile_favorite_departments.findMany({
      where: { userprofile_id: user.id },
      include:{
        department: true
      }
    })).map((favoriteDepartment) => favoriteDepartment.department);
    return favoriteDepartments;
  }

  async getMajors(user: session_userprofile): Promise<subject_department[]>{
    const majors = (await this.prisma.session_userprofile_majors.findMany({
      where: { userprofile_id: user.id },
      include:{
        subject_department: true
      }
    })).map((major) => major.subject_department);
    return majors;
  }

  async getMinors(user: session_userprofile): Promise<subject_department[]>{
    const minors = (await this.prisma.session_userprofile_minors.findMany({
      where: { userprofile_id: user.id },
      include:{
        subject_department: true
      }
    })).map((minor) => minor.subject_department);
    return minors;
  }

  async getSpecializedMajors(user: session_userprofile): Promise<subject_department[]>{
    const specializedMajors = (await this.prisma.session_userprofile_specialized_major.findMany({
      where: {userprofile_id: user.id},
      include:{
        subject_department: true
      }
    })).map((specializedMajor) => specializedMajor.subject_department);
    return specializedMajors;
  }
}