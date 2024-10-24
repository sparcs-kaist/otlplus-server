import { Injectable } from '@nestjs/common';
import { EDepartment } from '@src/common/entities/EDepartment';
import { ELecture } from '@src/common/entities/ELecture';
import { EProfessor } from '@src/common/entities/EProfessor';
import { STAFF_ID } from '@src/common/interfaces/constants/professor';
import {
  ChargeDerivedProfessorInfo,
  DerivedLectureInfo,
  LectureDerivedCourseInfo,
  LectureDerivedDepartmentInfo,
} from '@src/modules/sync/types';
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

  async getExistingDetailedLectures({
    year,
    semester,
  }: {
    year: number;
    semester: number;
  }): Promise<ELecture.Details[]> {
    return await this.prisma.subject_lecture.findMany({
      where: { year, semester, deleted: false }, // 기존 코드에서 한 번 삭제된 강의는 복구되지 않고 새로 생성하던 것으로 보임.
      include: ELecture.Details.include,
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

  async getExistingDepartments(): Promise<EDepartment.Basic[]> {
    return await this.prisma.subject_department.findMany();
  }

  async createDepartment(data: LectureDerivedDepartmentInfo) {
    return await this.prisma.subject_department.create({
      data: {
        id: data.id,
        num_id: data.num_id,
        code: data.code,
        name: data.name,
        name_en: data.name_en,
        visible: true,
      },
    });
  }

  async updateDepartment(id: number, data: Partial<EDepartment.Basic>) {
    return await this.prisma.subject_department.update({
      where: { id },
      data,
    });
  }

  async getExistingCoursesByOldCodes(oldCodes: string[]) {
    return await this.prisma.subject_course.findMany({
      where: { old_code: { in: oldCodes } },
    });
  }

  async createCourse(data: LectureDerivedCourseInfo) {
    return await this.prisma.subject_course.create({
      data: {
        old_code: data.old_code,
        department_id: data.department_id,
        type: data.type,
        type_en: data.type_en,
        title: data.title,
        title_en: data.title_en,
        title_en_no_space: data.title_en.replace(/\s/g, ''),
        title_no_space: data.title.replace(/\s/g, ''),
        summury: '',
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

  async updateCourse(id: number, data: Partial<ELecture.Basic>) {
    return await this.prisma.subject_course.update({
      where: { id },
      data: {
        ...data,
        title_no_space: data.title && data.title.replace(/\s/g, ''),
        title_en_no_space: data.title_en && data.title_en.replace(/\s/g, ''),
      },
    });
  }

  async getExistingProfessorsById(professorIds: number[]) {
    return await this.prisma.subject_professor.findMany({
      where: { professor_id: { in: professorIds } },
    });
  }

  async createProfessor(data: ChargeDerivedProfessorInfo) {
    return await this.prisma.subject_professor.create({
      data: {
        ...data,
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

  async updateProfessor(id: number, data: Partial<EProfessor.Basic>) {
    return await this.prisma.subject_professor.update({
      where: { id },
      data,
    });
  }

  async createLecture(data: DerivedLectureInfo) {
    return await this.prisma.subject_lecture.create({
      data: {
        ...data,
        deleted: false,
        title_no_space: data.title.replace(/\s/g, ''),
        title_en_no_space: data.title_en.replace(/\s/g, ''),
        grade_sum: 0,
        load_sum: 0,
        speech_sum: 0,
        grade: 0,
        load: 0,
        speech: 0,
        review_total_weight: 0,
      },
    });
  }

  async updateLecture(id: number, data: Partial<ELecture.Basic>) {
    return await this.prisma.subject_lecture.update({
      where: { id },
      data,
    });
  }

  async updateLectureProfessors(
    id: number,
    { added, removed }: { added: number[]; removed: number[] },
  ) {
    if (removed.length)
      await this.prisma.subject_lecture_professors.deleteMany({
        where: {
          lecture_id: id,
          professor_id: { in: removed },
        },
      });
    if (added.length)
      await this.prisma.subject_lecture_professors.createMany({
        data: added.map((professor_id) => ({
          lecture_id: id,
          professor_id,
        })),
      });
  }
}
