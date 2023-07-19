import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class ProfessorRepository {
  constructor(private readonly prisma: PrismaService){}

  getProfessorById(professor_id: number) {
    return this.prisma.subject_professor.findUnique({
      where: {
        id: professor_id
      }
    })
  }
}