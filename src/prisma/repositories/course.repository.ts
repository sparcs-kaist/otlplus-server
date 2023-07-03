import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { subject_course, subject_lecture } from "@prisma/client";

@Injectable()
export class CourseRepository{
  constructor(private readonly prisma: PrismaService){}
  
  private TYPE_ACRONYMS = {
    "GR": "General Required",
    "MGC": "Mandatory General Courses",
    "BE": "Basic Elective",
    "BR": "Basic Required",
    "EG": "Elective(Graduate)",
    "HSE": "Humanities & Social Elective",
    "OE": "Other Elective",
    "ME": "Major Elective",
    "MR": "Major Required",
  }
  private MAJOR_ACRONYMS = [
      "CE",
      "MSB",
      "ME",
      "PH",
      "BiS",
      "IE",
      "ID",
      "BS",
      "CBE",
      "MAS",
      "MS",
      "NQE",
      "HSS",
      "EE",
      "CS",
      "AE",
      "CH",
      "TS",
  ]

  async filterByDepartment <T extends subject_course|subject_lecture>(querySet: T, department: string[]): Promise<T> {
    if (!department || department.length === 0) {
      return querySet;
    }

    if (department.includes('ALL')) {
      return querySet;
    } else if (department.includes('ETC')) {
      const excludedDepartments = this.MAJOR_ACRONYMS.filter((code) => !department.includes(code));
      return this.prisma.subject_course.findMany({
        where: {
          department_id: { notIn: excludedDepartments }
        },
      });
    } else {
      return this.prisma.subject_course.findMany({
        where: {
          department: {
            code: {
              in: department,
            },
          },
        },
      });
    }
  }
}