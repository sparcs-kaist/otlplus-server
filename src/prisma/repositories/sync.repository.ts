import { Injectable } from '@nestjs/common';
import { ELecture } from '@src/common/entities/ELecture';
import { EProfessor } from '@src/common/entities/EProfessor';
import { STAFF_ID } from '@src/common/interfaces/constants/professor';
import { ESemester } from 'src/common/entities/ESemester';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SyncRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getDefaultSemester(): Promise<ESemester.Basic | null> {
    const now = new Date();
    return await this.prisma.subject_semester.findFirst({
      where: { courseDesciptionSubmission: { lt: now } },
      orderBy: { courseDesciptionSubmission: 'desc' },
    });
  }

  async getExistingLectures({
    year,
    semester,
  }: {
    year: number;
    semester: number;
  }): Promise<ELecture.Basic[]> {
    return await this.prisma.subject_lecture.findMany({
      where: { year, semester },
    });
  }

  async getOrCreateStaffProfessor(): Promise<EProfessor.Basic> {
    const staffProfessor = await this.prisma.subject_professor.findFirst({
      where: { professor_id: STAFF_ID },
    });
    if (staffProfessor) return staffProfessor;
    return await this.prisma.subject_professor.create({
      data: {
        professor_name: 'Staff',
        professor_name_en: 'Staff',
        professor_id: STAFF_ID,
        major: '',
        grade_sum: 0,
        load_sum: 0,
        speech_sum: 0,
        review_total_weight: 0,
        grade: 0,
        load: 0,
        speech: 0,
      },
    });
  }
}
