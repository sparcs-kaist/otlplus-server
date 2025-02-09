import { Injectable } from '@nestjs/common';
import {
  ChargeDerivedProfessorInfo,
  DerivedClasstimeInfo,
  DerivedExamtimeInfo,
  DerivedLectureInfo,
  LectureDerivedCourseInfo,
  LectureDerivedDepartmentInfo,
} from '@src/modules/sync/types';
import { PrismaService } from '../prisma.service';
import { EDepartment, ELecture, EProfessor, ESemester, EUserProfile } from '@otl/api-interface/src/entities';
import { STAFF_ID } from '@otl/api-interface/src/interfaces';

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
    return this.prisma.subject_lecture.findMany({
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

  async getExistingCoursesByNewCodes(newCodes: string[]) {
    return await this.prisma.subject_course.findMany({
      where: { new_code: { in: newCodes } },
    });
  }

  async createCourse(data: LectureDerivedCourseInfo) {
    return await this.prisma.subject_course.create({
      data: {
        old_code: data.old_code,
        new_code: data.new_code,
        department_id: data.department_id,
        type: data.type,
        type_en: data.type_en,
        title: data.title,
        title_en: data.title_en,
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

  async updateLectureProfessors(id: number, { added, removed }: { added: number[]; removed: number[] }) {
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

  async markLecturesDeleted(ids: number[]) {
    await this.prisma.subject_lecture.updateMany({
      where: { id: { in: ids } },
      data: { deleted: true },
    });
  }

  async updateLectureExamtimes(id: number, { added, removed }: { added: DerivedExamtimeInfo[]; removed: number[] }) {
    if (removed.length)
      await this.prisma.subject_examtime.deleteMany({
        where: { id: { in: removed } },
      });
    if (added.length)
      await this.prisma.subject_examtime.createMany({
        data: added.map((examtime) => ({
          lecture_id: id,
          ...examtime,
        })),
      });
  }

  async updateLectureClasstimes(id: number, { added, removed }: { added: DerivedClasstimeInfo[]; removed: number[] }) {
    if (removed.length)
      await this.prisma.subject_classtime.deleteMany({
        where: { id: { in: removed } },
      });
    if (added.length)
      await this.prisma.subject_classtime.createMany({
        data: added.map((classtime) => ({
          lecture_id: id,
          ...classtime,
        })),
      });
  }

  async getUserExistingTakenLectures({
    year,
    semester,
  }: {
    year: number;
    semester: number;
  }): Promise<EUserProfile.WithTakenLectures[]> {
    return await this.prisma.session_userprofile.findMany({
      where: { taken_lectures: { some: { lecture: { year, semester } } } },
      include: { taken_lectures: { where: { lecture: { year, semester } } } },
    });
  }

  async getUserProfileIdsFromStudentIds(studentIds: number[]) {
    return await this.prisma.session_userprofile.findMany({
      where: { student_id: { in: studentIds.map((id) => id.toString()) } },
      select: { id: true, student_id: true },
    });
  }

  async updateTakenLectures(
    userprofile_id: number,
    data: {
      remove: number[];
      add: number[];
    },
  ) {
    if (data.remove.length)
      await this.prisma.session_userprofile_taken_lectures.deleteMany({
        where: { id: { in: data.remove } },
      });
    if (data.add.length) {
      await this.prisma.session_userprofile_taken_lectures.createMany({
        data: data.add.map((lecture_id) => ({ userprofile_id, lecture_id })),
      });
    }
  }
  async replaceRawTakenLectures(
    data: {
      studentId: number;
      lectureId: number;
    }[],
    { year, semester }: { year: number; semester: number },
  ) {
    await this.prisma.sync_taken_lectures.deleteMany({
      where: { year, semester },
    });
    await this.prisma.sync_taken_lectures.createMany({
      data: data.map(({ studentId, lectureId }) => ({
        year,
        semester,
        student_id: studentId,
        lecture_id: lectureId,
      })),
    });
  }

  async getUserWithId(userId: number) {
    return await this.prisma.session_userprofile.findUnique({
      where: { id: userId },
    });
  }

  async getRawTakenLecturesOfStudent(student_id: number) {
    return (
      await this.prisma.sync_taken_lectures.findMany({
        where: { student_id },
      })
    ).map((l) => l.lecture_id);
  }

  async repopulateTakenLecturesOfUser(userId: number, takenLectures: number[]) {
    await this.prisma.session_userprofile_taken_lectures.deleteMany({
      where: { userprofile_id: userId },
    });
    await this.prisma.session_userprofile_taken_lectures.createMany({
      data: takenLectures.map((lecture_id) => ({
        userprofile_id: userId,
        lecture_id,
      })),
    });
  }
}
