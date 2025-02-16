import { Injectable } from '@nestjs/common';
import { STAFF_ID } from '@otl/api-interface/src';
import {
  EDepartment,
  ELecture,
  EProfessor,
  EReview,
  ESemester,
  EUser,
  EUserProfile,
} from '@otl/api-interface/src/entities';
import { ClassTimeInfo } from '@otl/scholar-sync/common/domain/ClassTimeInfo';
import { CourseInfo } from '@otl/scholar-sync/common/domain/CourseInfo';
import { DepartmentInfo } from '@otl/scholar-sync/common/domain/DepartmentInfo';
import { ExamtimeInfo } from '@otl/scholar-sync/common/domain/ExamTimeInfo';
import { LectureInfo } from '@otl/scholar-sync/common/domain/LectureInfo';
import { ProfessorInfo } from '@otl/scholar-sync/common/domain/ProfessorInfo';
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

  async createDepartment(data: DepartmentInfo) {
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

  async createCourse(data: CourseInfo) {
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

  async createProfessor(data: ProfessorInfo) {
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

  async createLecture(data: LectureInfo) {
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

  async updateLectureExamtimes(id: number, { added, removed }: { added: ExamtimeInfo[]; removed: number[] }) {
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

  async updateLectureClasstimes(id: number, { added, removed }: { added: ClassTimeInfo[]; removed: number[] }) {
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

  // Fetch humanity reviews (HSS department)
  async getHumanityReviews(): Promise<EReview.WithLectures[]> {
    return this.prisma.review_review.findMany({
      where: {
        course: {
          subject_department: {
            code: 'HSS',
          },
        },
      },
      include: EReview.WithLectures.include,
    });
  }

  // Fetch major reviews (Non-HSS department)
  async getMajorReviews(): Promise<EReview.WithLectures[]> {
    return this.prisma.review_review.findMany({
      where: {
        AND: {
          course: {
            subject_department: {
              code: { not: 'HSS' },
              visible: true,
            },
          },
        },
      },
      include: EReview.WithLectures.include,
    });
  }

  // Clear all humanity best reviews
  async clearHumanityBestReviews() {
    return this.prisma.review_humanitybestreview.deleteMany();
  }

  // Clear all major best reviews
  async clearMajorBestReviews() {
    return this.prisma.review_majorbestreview.deleteMany();
  }

  // Add new humanity best reviews
  async addHumanityBestReviews(reviews: { reviewId: number }[]) {
    return this.prisma.review_humanitybestreview.createMany({
      data: reviews.map((review) => ({ review_id: review.reviewId })),
    });
  }

  // Add new major best reviews
  async addMajorBestReviews(reviews: { reviewId: number }[]) {
    return this.prisma.review_majorbestreview.createMany({
      data: reviews.map((review) => ({ review_id: review.reviewId })),
    });
  }

  async getSemesters(take?: number) {
    const now = new Date();
    return await this.prisma.subject_semester.findMany({
      take: take ?? 3,
      where: { courseDesciptionSubmission: { lt: now } },
      orderBy: { courseDesciptionSubmission: 'desc' },
    });
  }

  getUsersByStudentIds(studentIds: string[]): Promise<EUser.Basic[]> {
    return this.prisma.session_userprofile.findMany({
      where: { student_id: { in: studentIds } },
    });
  }

  getUsersWithMajorsByStudentIds(studentIds: string[]): Promise<EUser.WithMajors[]> {
    return this.prisma.session_userprofile.findMany({
      where: { student_id: { in: studentIds } },
      include: EUser.WithMajors.include,
    });
  }

  getUsersWithMinorsByStudentIds(studentIds: string[]): Promise<EUser.WithMinors[]> {
    return this.prisma.session_userprofile.findMany({
      where: { student_id: { in: studentIds } },
      include: EUser.WithMinors.include,
    });
  }

  async updateUserDepartment(id: number, departmentId: number): Promise<EUser.Basic> {
    return this.prisma.session_userprofile.update({
      where: { id: id },
      data: {
        department_id: departmentId,
      },
    });
  }

  async getDepartments(): Promise<EDepartment.Basic[]> {
    return this.prisma.subject_department.findMany({
      where: { visible: true },
    });
  }

  async createUserOtherMajor(userId: number, otherMajorId: any) {}

  async createUserMajor(userId: number, departmentId: number) {}

  async createManyUserMajor(records: { userId: number; departmentId: number }[]) {
    return this.prisma.session_userprofile_majors.createMany({
      data: records.map((record) => ({
        userprofile_id: record.userId,
        department_id: record.departmentId,
      })),
    });
  }

  async createManyUserMinor(records: { userId: number; departmentId: number }[]) {
    return this.prisma.session_userprofile_minors.createMany({
      data: records.map((record) => ({
        userprofile_id: record.userId,
        department_id: record.departmentId,
      })),
    });
  }

  async deleteUserMajor(userId: number, departmentId: number) {
    return this.prisma.session_userprofile_majors.delete({
      where: {
        userprofile_id_department_id: {
          userprofile_id: userId,
          department_id: departmentId,
        },
      },
    });
  }

  async deleteUserMinor(userId: number, departmentId: number) {
    return this.prisma.session_userprofile_minors.delete({
      where: {
        userprofile_id_department_id: {
          userprofile_id: userId,
          department_id: departmentId,
        },
      },
    });
  }
}
