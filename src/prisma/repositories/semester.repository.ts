import { PrismaService } from "../prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class SemesterRepository{
  constructor(private readonly prisma: PrismaService) {
  }

  async existsSemester(year: number, semester: number): Promise<boolean> {
    const existsSemester: boolean = await this.prisma.subject_semester.findFirstOrThrow({
      where: {
        year: year,
        semester: semester
      }
    }).catch((e) => false)
      .then((s)=> true);
    return existsSemester;
  }
}