import { SyncRepository } from '@otl/scholar-sync/prisma/repositories/sync.repository';
import { SlackNotiService } from '@otl/scholar-sync/clients/slack/slackNoti.service';
import { EDepartment, ELecture, EProfessor, EReview, ETakenLecture, EUser } from '@otl/api-interface/src/entities';
import { Injectable, Logger } from '@nestjs/common';
import { review_review } from '@prisma/client';
import { DepartmentInfo } from '@otl/scholar-sync/common/domain/DepartmentInfo';
import { CourseInfo } from '@otl/scholar-sync/common/domain/CourseInfo';
import { ProfessorInfo } from '@otl/scholar-sync/common/domain/ProfessorInfo';
import { LectureInfo } from '@otl/scholar-sync/common/domain/LectureInfo';
import { ExamtimeInfo } from '@otl/scholar-sync/common/domain/ExamTimeInfo';
import { ClassTimeInfo } from '@otl/scholar-sync/common/domain/ClassTimeInfo';
import { ESemester } from '@otl/api-interface/src/entities/ESemester';
import { IScholar } from '@otl/scholar-sync/clients/scholar/IScholar';
import { groupBy, normalizeArray } from '@otl/scholar-sync/modules/sync/util';
import { DegreeInfo } from '@otl/scholar-sync/common/domain/DegreeInfo';
import { APPLICATION_TYPE, MajorInfo } from '@otl/scholar-sync/common/domain/MajorInfo';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);
  private readonly BATCH_SIZE = 1000;
  private readonly CONCURRENCY_LIMIT = 10;

  constructor(
    private readonly syncRepository: SyncRepository,
    private readonly slackNoti: SlackNotiService,
  ) {}

  async getDefaultSemester(): Promise<ESemester.Basic> {
    return await this.syncRepository.getDefaultSemester();
  }

  async getSemesters(take?: number): Promise<ESemester.Basic[]> {
    return await this.syncRepository.getSemesters(take);
  }

  async syncScholarDB(data: IScholar.ScholarDBBody) {
    this.slackNoti.sendSyncNoti(
      `syncScholarDB ${data.year}-${data.semester}: ${data.lectures.length} lectures, ${data.charges.length} charges`,
    );
    const result: any = {
      time: new Date().toISOString(),
      departments: {
        created: [],
        updated: [],
        errors: [],
      },
      courses: {
        created: [],
        updated: [],
        errors: [],
      },
      professors: {
        created: [],
        updated: [],
        errors: [],
      },
      lectures: {
        created: [],
        updated: [],
        chargeUpdated: [],
        deleted: [],
        errors: [],
      },
    };

    const staffProfessor = await this.syncRepository.getOrCreateStaffProfessor();

    /// Department update
    /**
     * Temporary Comment out
     * 모든 Department ID가 다 바뀌었는데 어떻게 바뀌었는지 모름.
     * 일단 1/3일 타겟까지는 업데이트하지말고 수강신청 기간 이후에 적절히 수동으로 바꿔줄 수 있도록 할 예정
     **/
    const existingDepartments = await this.syncRepository.getExistingDepartments();
    const departmentMap: Record<number, EDepartment.Basic> = Object.fromEntries(
      existingDepartments.map((dept) => [dept.id, dept]),
    );
    this.slackNoti.sendSyncNoti(`Found ${existingDepartments.length} existing departments, updating...`);
    const processedDepartmentIds = new Set<number>();
    for (const lecture of data.lectures) {
      try {
        if (processedDepartmentIds.has(lecture.DEPT_ID)) continue; // skip if already processed
        processedDepartmentIds.add(lecture.DEPT_ID);

        const departmentInfo = DepartmentInfo.deriveDepartmentInfo(lecture);
        const foundDepartment = departmentMap[lecture.DEPT_ID];
        console.log('DepartmentInfo', departmentInfo);

        // No department found, create new department
        if (!foundDepartment) {
          const newDept = await this.syncRepository.createDepartment(departmentInfo);
          departmentMap[newDept.id] = newDept;
          result.departments.created.push(newDept);

          const deptsToMakeInvisible = existingDepartments.filter((l) => l.code === newDept.code && l.visible);
          await Promise.all(
            deptsToMakeInvisible.map((l) => this.syncRepository.updateDepartment(l.id, { visible: false })),
          );
        } else if (!DepartmentInfo.equals(departmentInfo, foundDepartment)) {
          const updated = await this.syncRepository.updateDepartment(foundDepartment.id, {
            num_id: departmentInfo.num_id,
            code: departmentInfo.code,
            name: departmentInfo.name,
            name_en: departmentInfo.name_en,
          });
          departmentMap[foundDepartment.id] = updated;
          result.departments.updated.push([foundDepartment, updated]);
        }
      } catch (e: any) {
        result.departments.errors.push({
          dept_id: lecture.DEPT_ID,
          error: e.message || 'Unknown error',
        });
      }
    }
    this.slackNoti.sendSyncNoti(
      `Department created: ${result.departments.created.length}, updated: ${result.departments.updated.length}, errors: ${result.departments.errors.length}`,
    );

    console.log('Department Sync Result', result.departments);

    /// Course update
    // TODO: OLD_NO may not be available later, need to change to use new code
    // -> SUBJECT_NO(DB의 code 및 new_code) 사용으로 수정
    const lectureByCode = new Map(data.lectures.map((l) => [l.SUBJECT_NO, l] as const));
    const existingCourses = await this.syncRepository.getExistingCoursesByNewCodes(Array.from(lectureByCode.keys()));
    this.slackNoti.sendSyncNoti(`Found ${existingCourses.length} existing related courses, updating...`);
    const courseMap = new Map(existingCourses.map((l) => [l.new_code, l] as const));
    for (const [new_code, lecture] of lectureByCode.entries()) {
      try {
        const foundCourse = courseMap.get(new_code);
        const derivedCourse = CourseInfo.deriveCourseInfo(lecture);
        if (!foundCourse) {
          const newCourse = await this.syncRepository.createCourse(derivedCourse);
          result.courses.created.push(newCourse);
          courseMap.set(new_code, newCourse);
        } else {
          if (!CourseInfo.equals(derivedCourse, foundCourse)) {
            const updatedCourse = await this.syncRepository.updateCourse(foundCourse.id, derivedCourse);
            result.courses.updated.push([foundCourse, updatedCourse]);
            courseMap.set(new_code, updatedCourse);
          }
        }
      } catch (e: any) {
        result.courses.errors.push({
          new_code,
          error: e.message || 'Unknown error',
        });
      }
    }
    this.slackNoti.sendSyncNoti(
      `Course created: ${result.courses.created.length}, updated: ${result.courses.updated.length}, errors: ${result.courses.errors.length}`,
    );

    console.log('Course Sync Result', result.courses);

    // Professor update
    const existingProfessors = await this.syncRepository.getExistingProfessorsById(data.charges.map((c) => c.PROF_ID));
    const professorMap = new Map(existingProfessors.map((p) => [p.professor_id, p]));
    this.slackNoti.sendSyncNoti(`Found ${existingProfessors.length} existing related professors, updating...`);
    const processedProfessorIds = new Set<number>();
    for (const charge of data.charges) {
      try {
        // TODO: 아래 로직 변경 필요할 수 있음? id는 staff id인데 실제 강사 이름이 들어있음. 데이터에서 staff id 830으로 확인 바람.
        // 기존 코드에서도 이렇게 처리하고 있었음.
        // staff id인 경우 이름이 각자 다를 수 있다는 것임.
        if (charge.PROF_ID === staffProfessor.professor_id) continue;
        if (processedProfessorIds.has(charge.PROF_ID)) continue;
        processedProfessorIds.add(charge.PROF_ID);

        const professor = professorMap.get(charge.PROF_ID);
        const derivedProfessor = ProfessorInfo.deriveProfessorInfo(charge);

        if (!professor) {
          const newProfessor = await this.syncRepository.createProfessor(derivedProfessor);
          professorMap.set(charge.PROF_ID, newProfessor);
          result.professors.created.push(newProfessor);
        } else if (!ProfessorInfo.equals(professor, derivedProfessor)) {
          const updatedProfessor = await this.syncRepository.updateProfessor(professor.id, derivedProfessor);
          professorMap.set(charge.PROF_ID, updatedProfessor);
          result.professors.updated.push([professor, updatedProfessor]);
        }
        console.log('ProfessorInfo', derivedProfessor);
      } catch (e: any) {
        result.professors.errors.push({
          prof_id: charge.PROF_ID,
          error: e.message || 'Unknown error',
        });
      }
    }
    this.slackNoti.sendSyncNoti(
      `Professor created: ${result.professors.created.length}, updated: ${result.professors.updated.length}, errors: ${result.professors.errors.length}`,
    );

    console.log('Professor Sync Result', result.professors);

    /// Lecture update
    const existingLectures = await this.syncRepository.getExistingDetailedLectures({
      year: data.year,
      semester: data.semester,
    });
    this.slackNoti.sendSyncNoti(`Found ${existingLectures.length} existing lectures, updating...`);
    const notExistingLectures = new Set(existingLectures.map((l) => l.id));
    for (const lecture of data.lectures) {
      try {
        const foundLecture = existingLectures.find(
          (l) => l.new_code === lecture.SUBJECT_NO && l.class_no.trim() === lecture.LECTURE_CLASS.trim(),
        );
        const course_id = courseMap.get(lecture.SUBJECT_NO)?.id;
        if (!course_id) throw new Error(`Course not found for lecture ${lecture.SUBJECT_NO}`);
        const derivedLecture = LectureInfo.deriveLectureInfo(lecture, course_id);
        const professorCharges = data.charges.filter(
          (c) =>
            c.LECTURE_YEAR === lecture.LECTURE_YEAR &&
            c.LECTURE_TERM === lecture.LECTURE_TERM &&
            c.SUBJECT_NO === lecture.SUBJECT_NO &&
            c.LECTURE_CLASS.trim() === lecture.LECTURE_CLASS.trim(),
        );

        if (foundLecture) {
          notExistingLectures.delete(foundLecture.id);
          if (LectureInfo.equals(foundLecture, derivedLecture)) {
            const updatedLecture = await this.syncRepository.updateLecture(foundLecture.id, derivedLecture);
            result.lectures.updated.push([foundLecture, updatedLecture]);
          }
          const { addedIds, removedIds } = this.lectureProfessorsChanges(foundLecture, professorCharges, professorMap);

          if (addedIds.length || removedIds.length) {
            await this.syncRepository.updateLectureProfessors(foundLecture.id, {
              added: addedIds,
              removed: removedIds,
            });
            result.lectures.chargeUpdated.push({
              lecture: foundLecture,
              added: addedIds.map((id) => professorMap.get(id)),
              removed: removedIds.map((id) => professorMap.get(id) || { id }),
            });
          }
        } else {
          const newLecture = await this.syncRepository.createLecture(derivedLecture);
          const addedIds = professorCharges.map((charge) => professorMap.get(charge.PROF_ID)!.id);

          await this.syncRepository.updateLectureProfessors(newLecture.id, {
            added: addedIds,
            removed: [],
          });
          result.lectures.created.push({ ...newLecture, professors: addedIds });
        }
      } catch (e: any) {
        result.lectures.errors.push({
          lecture: {
            code: lecture.SUBJECT_NO,
            class_no: lecture.LECTURE_CLASS,
          },
          error: e.message || 'Unknown error',
        });
      }
    }

    // Remove not existing lectures
    try {
      await this.syncRepository.markLecturesDeleted(Array.from(notExistingLectures));
      result.lectures.deleted = Array.from(notExistingLectures);
    } catch (e: any) {
      result.lectures.errors.push({
        lecturesToDelete: Array.from(notExistingLectures),
        error: e.message || 'Unknown error',
      });
    }

    this.slackNoti.sendSyncNoti(
      `Lecture created: ${result.lectures.created.length}, updated: ${result.lectures.updated.length}, errors: ${result.lectures.errors.length}`,
    );

    console.log('Lecture Sync Result', result.lectures);

    return result;
  }

  lectureProfessorsChanges(
    lecture: ELecture.Details,
    charges: IScholar.ScholarChargeType[],
    professorMap: Map<number, EProfessor.Basic>,
  ): { addedIds: number[]; removedIds: number[] } {
    const addedIds = charges
      .filter((charge) => !lecture.subject_lecture_professors.find((p) => p.professor.professor_id === charge.PROF_ID))
      .map((charge) => professorMap.get(charge.PROF_ID)!.id);
    const removedIds = lecture.subject_lecture_professors
      .filter((p) => !charges.find((charge) => charge.PROF_ID === p.professor.professor_id))
      .map((p) => p.professor.id);
    return {
      addedIds: Array.from(new Set(addedIds)),
      removedIds: Array.from(new Set(removedIds)),
    };
  }

  async syncExamTime(data: IScholar.ExamtimeBody) {
    return this.syncTime(
      data.year,
      data.semester,
      data.examtimes,
      'examtime',
      ExamtimeInfo.deriveExamtimeInfo,
      ExamtimeInfo.equals,
    );
  }

  async syncClassTime(data: IScholar.ClasstimeBody) {
    return this.syncTime(
      data.year,
      data.semester,
      data.classtimes,
      'classtime',
      ClassTimeInfo.deriveClasstimeInfo,
      ClassTimeInfo.equals,
    );
  }

  async syncTime<
    TYPE extends 'examtime' | 'classtime',
    T extends TYPE extends 'examtime' ? IScholar.ScholarExamtimeType : IScholar.ScholarClasstimeType,
    D extends TYPE extends 'examtime' ? ExamtimeInfo : ClassTimeInfo,
  >(
    year: number,
    semester: number,
    data: T[],
    type: TYPE,
    deriveInfo: (time: T) => D,
    matches: (derivedTime: D, existingTime: any) => boolean,
  ) {
    this.slackNoti.sendSyncNoti(`sync ${type} ${year}-${semester}: ${data.length} ${type}s`);
    const result: any = {
      time: new Date().toISOString(),
      updated: [],
      skipped: [],
      errors: [],
    };

    const existingLectures = await this.syncRepository.getExistingDetailedLectures({
      year: year,
      semester: semester,
    });

    this.slackNoti.sendSyncNoti(`Found ${existingLectures.length} existing lectures, updating ${type}s...`);

    const lecturePairMap = new Map<number, [ELecture.Details, T[]]>(existingLectures.map((l) => [l.id, [l, []]]));

    for (const time of data) {
      const lecture = existingLectures.find(
        (l) => l.code === time.SUBJECT_NO && l.class_no.trim() === time.LECTURE_CLASS.trim(),
      );
      if (!lecture) {
        result.skipped.push({
          subject_no: time.SUBJECT_NO,
          lecture_class: time.LECTURE_CLASS,
          error: 'Lecture not found',
        });
        continue;
      }
      const [, times] = lecturePairMap.get(lecture.id)!;
      times.push(time);
    }

    for (const [lecture, times] of lecturePairMap.values()) {
      try {
        const derivedTimes = times.map(deriveInfo);
        const existingTimes = type === 'examtime' ? lecture.subject_examtime : lecture.subject_classtime;
        const timesToRemove = [];

        for (const existing of existingTimes) {
          const idx = derivedTimes.findIndex((t) => matches(t, existing));
          if (idx === -1) timesToRemove.push(existing.id);
          else derivedTimes.splice(idx, 1); // remove matched time
        }
        const timesToAdd = derivedTimes;
        if (type === 'examtime')
          await this.syncRepository.updateLectureExamtimes(lecture.id, {
            added: timesToAdd,
            removed: timesToRemove,
          });
        else
          await this.syncRepository.updateLectureClasstimes(lecture.id, {
            added: timesToAdd as any,
            removed: timesToRemove,
          });

        if (timesToAdd.length > 0 || timesToRemove.length > 0) {
          result.updated.push({
            lecture: lecture.code,
            class_no: lecture.class_no,
            previous: existingTimes,
            added: timesToAdd,
            removed: timesToRemove,
          });
        }
      } catch (e: any) {
        result.errors.push({
          lecture: {
            code: lecture.code,
            class_no: lecture.class_no,
          },
          error: e.message || 'Unknown error',
        });
      }
    }

    this.slackNoti.sendSyncNoti(
      `${type.charAt(0).toUpperCase() + type.slice(1)} updated: ${
        result.updated.length
      }, skipped: ${result.skipped.length}, errors: ${result.errors.length}`,
    );

    return result;
  }

  async syncTakenLecture(data: IScholar.TakenLectureBody) {
    this.slackNoti.sendSyncNoti(
      `syncTakenLecture: ${data.year}-${data.semester}: ${data.attend.length} attend records`,
    );

    const result: any = {
      time: new Date().toISOString(),
      updated: [],
      errors: [],
    };

    const existingLectures = await this.syncRepository.getExistingDetailedLectures({
      year: data.year,
      semester: data.semester,
    });
    const existingUserTakenLectures = (
      await this.syncRepository.getUserExistingTakenLectures({
        year: data.year,
        semester: data.semester,
      })
    ).filter((u) => !Number.isNaN(parseInt(u.student_id)));
    this.slackNoti.sendSyncNoti(
      `Found ${existingLectures.length} existing lectures, ${existingUserTakenLectures.length} existing user with taken records`,
    );
    const studentIds = Array.from(
      new Set([
        ...data.attend.map((a) => a.STUDENT_NO),
        ...existingUserTakenLectures.map((u) => parseInt(u.student_id)),
      ]),
    );

    /** 여러 user가 동일한 student_id를 가질 수 있음 (실제로 존재)
     * 따라서 student_id를 key로 하여 [taken_lectures, attend_lecture_ids, userprofile_id]를 저장
     * [0]]: 이미 DB에 저장된 수강 강의 목록. 동일한 student_id 여러 user들이 합쳐져있다.
     * [1]: attend에서 찾은 새로운 lecture_id 목록
     * [2]: student_id에 해당하는 userprofile id 목록
     */
    const studentPairMap = new Map<number, [ETakenLecture.Basic[], number[], number[]]>();

    for (const studentId of studentIds) {
      studentPairMap.set(studentId, [[], [], []]);
    }

    for (const user of existingUserTakenLectures) {
      const student_id = parseInt(user.student_id);
      const pair = studentPairMap.get(student_id)!;
      pair[0].push(...user.taken_lectures);
    }

    for (const attend of data.attend) {
      const lectureId = this.getLectureIdOfAttendRecord(existingLectures, attend);
      if (lectureId) {
        const pair = studentPairMap.get(attend.STUDENT_NO)!;
        pair[1].push(lectureId);
      } else
        result.errors.push({
          student_no: attend.STUDENT_NO,
          attend,
          error: 'lecture not found',
        });
    }

    const userprofiles = await this.syncRepository.getUserProfileIdsFromStudentIds(studentIds);
    for (const user of userprofiles) {
      const student_id = parseInt(user.student_id);
      const pair = studentPairMap.get(student_id)!;
      pair[2].push(user.id);
    }

    const saveToDB = [];
    let skipCount = 0;
    for (const [studentId, [existingTakenLectures, attendRecords, userprofileIds]] of studentPairMap) {
      try {
        if (attendRecords.length)
          saveToDB.push(
            ...attendRecords.map((lectureId) => ({
              studentId,
              lectureId,
            })),
          );

        if (userprofileIds.length === 0) {
          skipCount++;
          continue;
        }
        for (const userprofileId of userprofileIds) {
          const recordIdsToRemove = [];
          const recordsToAdd = [...attendRecords];
          for (const existing of existingTakenLectures.filter((e) => e.userprofile_id === userprofileId)) {
            const idx = recordsToAdd.indexOf(existing.lecture_id);
            if (idx === -1) recordIdsToRemove.push(existing.id);
            else recordsToAdd.splice(idx, 1);
          }

          if (recordIdsToRemove.length || recordsToAdd.length) {
            await this.syncRepository.updateTakenLectures(userprofileId, {
              remove: recordIdsToRemove,
              add: recordsToAdd,
            });
            result.updated.push({
              studentId,
              remove: recordIdsToRemove.map((id) => existingTakenLectures.find((e) => e.id === id)?.lecture_id),
              add: recordsToAdd,
            });
          }
        }
      } catch (e: any) {
        result.errors.push({ studentId, error: e.message || 'Unknown error' });
      }
    }

    await this.syncRepository.replaceRawTakenLectures(saveToDB, {
      year: data.year,
      semester: data.semester,
    });

    this.slackNoti.sendSyncNoti(
      `syncTakenLecture: ${result.updated.length} updated, ${skipCount} skipped, ${result.errors.length} errors`,
    );

    return result;
  }

  getLectureIdOfAttendRecord(lectures: ELecture.Basic[], attend: IScholar.ScholarAttendType) {
    const lecture = lectures.find(
      (l) => l.new_code === attend.SUBJECT_NO && l.class_no === attend.LECTURE_CLASS.trim(),
    );
    return lecture?.id;
  }

  async repopulateTakenLectureForStudent(userId: number) {
    const user = await this.syncRepository.getUserWithId(userId);
    if (!user) throw new Error('User not found');
    const studentId = parseInt(user.student_id);
    if (Number.isNaN(studentId)) return; // Skip if student_id is not a number
    const rawTakenLectures = await this.syncRepository.getRawTakenLecturesOfStudent(studentId);
    await this.syncRepository.repopulateTakenLecturesOfUser(studentId, rawTakenLectures);
  }

  async updateBestReviews() {
    this.logger.log('Running scheduled job: Update Best Reviews');

    // Process humanity reviews
    const humanityReviews = await this.syncRepository.getHumanityReviews();
    const humanityBestReviews = this.getBestReviews(humanityReviews, 50, 20);

    await this.syncRepository.clearHumanityBestReviews();
    await this.syncRepository.addHumanityBestReviews(humanityBestReviews.map((r) => ({ reviewId: r.id })));

    // Process major reviews
    const majorReviews = await this.syncRepository.getMajorReviews();
    const majorBestReviews = this.getBestReviews(majorReviews, 2000, 1000);

    await this.syncRepository.clearMajorBestReviews();
    await this.syncRepository.addMajorBestReviews(majorBestReviews.map((r) => ({ reviewId: r.id })));

    this.logger.log('BestReview updated by scheduled job');
  }

  private getBestReviews(
    reviews: EReview.WithLectures[],
    minLikedCount: number,
    maxResultCount: number,
  ): review_review[] {
    const likedCount = Math.max(minLikedCount, Math.floor(reviews.length / 10));

    const mostLikedReviews = reviews.sort((a, b) => this.calculateKey(b) - this.calculateKey(a)).slice(0, likedCount);

    const latestDateStart = new Date();
    latestDateStart.setDate(latestDateStart.getDate() - 7);

    const latestReviews = reviews.filter(
      (review) => review.written_datetime && new Date(review.written_datetime) >= latestDateStart,
    );

    const bestCandidateReviews = [...mostLikedReviews, ...latestReviews];
    return bestCandidateReviews.length > maxResultCount
      ? bestCandidateReviews.slice(0, maxResultCount)
      : bestCandidateReviews;
  }

  private calculateKey(review: EReview.WithLectures): number {
    const baseYear = new Date().getFullYear();
    const lectureYear = review.lecture.year;
    const yearDiff = baseYear - lectureYear > 0 ? baseYear - lectureYear : 0;
    return Math.floor((review.like / (review.lecture.audience + 1)) * Math.pow(0.85, yearDiff));
  }

  async syncDegree(data: IScholar.ScholarDegreeType[]) {
    this.slackNoti.sendSyncNoti(`syncDegree: ${data.length} degrees`);

    const result: {
      time: string;
      updated: { userId: number; departmentId: number }[];
      errors: { userId: number; departmentId: number }[];
    } = {
      time: new Date().toISOString(),
      updated: [],
      errors: [],
    };

    // 1. Collect all student numbers and map them to their degree info
    const studentIds = Array.from(new Set(data.map((d) => `${d.student_no}`)));
    const studentDegreeMap = normalizeArray<DegreeInfo>(
      data.map((d) => DegreeInfo.deriveDegreeInfo(d)),
      (d) => `${d.student_no}`,
    );

    // 2. Get the users that already exist in the system
    const existingUsers = await this.syncRepository.getUsersByStudentIds(studentIds);

    // We’ll update in chunks of 1,000
    const BATCH_SIZE = 1000;

    // Within each 1,000-chunk, we’ll limit concurrency to 20
    const CONCURRENCY_LIMIT = 10;

    const toUpdate = existingUsers
      .filter((user) => {
        const degreeInfo = studentDegreeMap[user.student_id];
        if (!degreeInfo) return false;
        else return !DegreeInfo.equals(degreeInfo, user);
      })
      .map((user) => {
        const degreeInfo = studentDegreeMap[user.student_id];
        return {
          userId: user.id,
          departmentId: degreeInfo.dept_id,
        };
      });

    for (let i = 0; i < toUpdate.length; i += BATCH_SIZE) {
      // Take a batch of up to 1,000 users
      const chunk = existingUsers.slice(i, i + BATCH_SIZE);

      // Map the chunk to the update payload
      const toUpdate = chunk
        .map((user) => {
          const degreeInfo = studentDegreeMap[user.student_id];
          if (!degreeInfo) return null;

          return {
            userId: user.id,
            departmentId: degreeInfo.dept_id,
          };
        })
        .filter(Boolean) as { userId: number; departmentId: number }[];

      for (let j = 0; j < toUpdate.length; j += CONCURRENCY_LIMIT) {
        const concurrencyChunk = toUpdate.slice(j, j + CONCURRENCY_LIMIT);

        await Promise.all(
          concurrencyChunk.map(async (item) => {
            try {
              await this.syncRepository.updateUserDepartment(item.userId, item.departmentId);
              result.updated.push(item);
            } catch (error) {
              result.errors.push(item);
            }
          }),
        );
      }
    }
    this.slackNoti.sendSyncNoti(
      `Degree updated: ${result.updated.length} / ${toUpdate.length}, errors: ${result.errors.length}`,
    );
    return result;
  }

  async syncOtherMajor(data: IScholar.ScholarOtherMajorType[]) {
    this.slackNoti.sendSyncNoti(`syncOtherMajor: ${data.length} other majors`);

    const result: {
      time: string;
      updated: { userId: number; departmentId: number }[];
      add: { userId: number; departmentId: number }[];
      removed: { userId: number; departmentId: number }[];
      errors: { userId: number; departmentId: number }[];
    } = {
      time: new Date().toISOString(),
      updated: [],
      add: [],
      removed: [],
      errors: [],
    };

    const departments = await this.syncRepository.getDepartments();
    const departmentMap = normalizeArray<EDepartment.Basic>(departments, (d) => d.name);

    // 1. Collect all student numbers and map them to their degree info
    const studentIds = Array.from(new Set(data.map((d) => `${d.STUDENT_ID}`)));
    const majorData = groupBy<MajorInfo<typeof APPLICATION_TYPE.MAJOR>, string>(
      data
        .filter((d) => d.APPLICATION_TYPE === '복수전공신청')
        .map((d) => MajorInfo.deriveMajorInfo<typeof APPLICATION_TYPE.MAJOR>(d, APPLICATION_TYPE.MAJOR, departmentMap)),
      (d) => `${d.student_id}`,
    );
    const minorData = groupBy<MajorInfo<typeof APPLICATION_TYPE.MINOR>, string>(
      data
        .filter((d) => d.APPLICATION_TYPE === '부전공신청')
        .map((d) => MajorInfo.deriveMajorInfo<typeof APPLICATION_TYPE.MINOR>(d, APPLICATION_TYPE.MINOR, departmentMap)),
      (d) => `${d.student_id}`,
    );

    // get users with majors
    const existingUsersWithMajors: EUser.WithMajors[] =
      await this.syncRepository.getUsersWithMajorsByStudentIds(studentIds);
    const existingUsersWithMajorsMap = groupBy(existingUsersWithMajors, (user) => user.id);
    const existingUsersWithMinors: EUser.WithMinors[] =
      await this.syncRepository.getUsersWithMinorsByStudentIds(studentIds);
    const existingUsersWithMinorsMap = groupBy(existingUsersWithMinors, (user) => user.id);

    const toUpdate = {
      major: existingUsersWithMajors
        .filter((user) => {
          const majorInfo = majorData[user.student_id];
          if (!majorInfo) return false;
          else return !MajorInfo.equals(majorInfo, user);
        })
        .map((user) => {
          const majorInfo = majorData[user.student_id];
          return {
            userId: user.id,
            majorInfoList: majorInfo,
          };
        }),
      minor: existingUsersWithMinors
        .filter((user) => {
          const minorInfo = minorData[user.student_id];
          if (!minorInfo) return false;
          else return !MajorInfo.equals(minorInfo, user);
        })
        .map((user) => {
          const minorInfo = minorData[user.student_id];
          return {
            userId: user.id,
            minorInfoList: minorInfo,
          };
        }),
    };

    const majorUpdate = {
      add: [] as { userId: number; departmentId: number }[],
      remove: [] as { userId: number; departmentId: number }[],
    };
    toUpdate.major.forEach((userMajorInfo) => {
      const userId = userMajorInfo.userId;
      const existingMajorInfo = existingUsersWithMajorsMap[userId];
      const majorInfoList = userMajorInfo.majorInfoList;

      // 기존 정보와 새로운 정보를 `department_id` 기준으로 비교
      const existingSet = new Set(existingMajorInfo.map((m) => m.department_id));
      const newSet = new Set(majorInfoList.map((m) => m.department_id));

      // 추가해야 할 전공: 새로운 리스트에는 있지만 기존 리스트에는 없는 항목
      const toAdd = majorInfoList
        .filter((m) => !existingSet.has(m.department_id))
        .map((m) => {
          return { userId: userId, departmentId: m.department_id };
        });

      // 제거해야 할 전공: 기존 리스트에는 있지만 새로운 리스트에는 없는 항목
      const toRemove = existingMajorInfo
        .filter((m) => !newSet.has(m.department_id))
        .map((m) => {
          return { userId: userId, departmentId: m.department_id };
        });

      if (toAdd.length > 0) {
        majorUpdate.add = majorUpdate.add.concat(toAdd);
      }
      if (toRemove.length > 0) {
        majorUpdate.remove = majorUpdate.remove.concat(toRemove);
      }
    });

    const minorUpdate = {
      add: [] as { userId: number; departmentId: number }[],
      remove: [] as { userId: number; departmentId: number }[],
    };
    toUpdate.minor.forEach((userMinorInfo) => {
      const userId = userMinorInfo.userId;
      const existingMinorInfo = existingUsersWithMinorsMap[userId];
      const minorInfoList = userMinorInfo.minorInfoList;

      // 기존 정보와 새로운 정보를 `department_id` 기준으로 비교
      const existingSet = new Set(existingMinorInfo.map((m) => m.department_id));
      const newSet = new Set(minorInfoList.map((m) => m.department_id));

      // 추가해야 할 전공: 새로운 리스트에는 있지만 기존 리스트에는 없는 항목
      const toAdd = minorInfoList
        .filter((m) => !existingSet.has(m.department_id))
        .map((m) => {
          return { userId: userId, departmentId: m.department_id };
        });

      // 제거해야 할 전공: 기존 리스트에는 있지만 새로운 리스트에는 없는 항목
      const toRemove = existingMinorInfo
        .filter((m) => !newSet.has(m.department_id))
        .map((m) => {
          return { userId: userId, departmentId: m.department_id };
        });

      if (toAdd.length > 0) {
        minorUpdate.add = minorUpdate.add.concat(toAdd);
      }
      if (toRemove.length > 0) {
        minorUpdate.remove = minorUpdate.remove.concat(toRemove);
      }
    });

    for (const update of [majorUpdate, minorUpdate]) {
      for (let i = 0; i < update.add.length; i += this.BATCH_SIZE) {
        // Take a batch of up to 1,000 users
        const chunk = update.add.slice(i, i + this.BATCH_SIZE);
        // Now break `toUpdate` into sub-chunks of size 20 (limited concurrency)

        // Parallel update each sub-chunk
        try {
          // Your single-row update method
          if (update === majorUpdate) {
            await this.syncRepository.createManyUserMajor(chunk);
          } else {
            await this.syncRepository.createManyUserMinor(chunk);
          }
          result.updated = result.updated.concat(chunk);
          result.add = result.add.concat(chunk);
        } catch (error) {
          result.errors = result.errors.concat(chunk);
        }
      }

      for (let i = 0; i < update.remove.length; i += this.BATCH_SIZE) {
        // Take a batch of up to 1,000 users
        const chunk = update.remove.slice(i, i + this.BATCH_SIZE);
        // Now break `toUpdate` into sub-chunks of size 20 (limited concurrency)
        for (let j = 0; j < chunk.length; j += this.CONCURRENCY_LIMIT) {
          const concurrencyChunk = chunk.slice(j, j + this.CONCURRENCY_LIMIT);

          // Parallel update each sub-chunk
          await Promise.all(
            concurrencyChunk.map(async (item) => {
              try {
                // Your single-row update method
                if (update === majorUpdate) {
                  await this.syncRepository.deleteUserMajor(item.userId, item.departmentId);
                } else {
                  await this.syncRepository.deleteUserMinor(item.userId, item.departmentId);
                }
                result.updated.push(item);
              } catch (error) {
                result.errors.push(item);
              }
            }),
          );
        }
      }
    }
    this.slackNoti.sendSyncNoti(
      `otherMajor updated: ${result.updated.length} / ${toUpdate.major.length + toUpdate.minor.length}, errors: ${result.errors.length}`,
    );
  }
}
