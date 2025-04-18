import { Injectable } from '@nestjs/common';
import { SlackNotiService } from './slackNoti.service';
import { SyncRepository } from '@otl/prisma-client/repositories';
import { ISync } from '@otl/server-nest/common/interfaces/ISync';
import { ELecture, ETakenLecture } from '@otl/prisma-client/entities';

@Injectable()
export class SyncTakenLectureService {
  constructor(
    private readonly syncRepository: SyncRepository,
    private readonly slackNoti: SlackNotiService,
  ) {}

  async syncTakenLecture(data: ISync.TakenLectureBody) {
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

  getLectureIdOfAttendRecord(lectures: ELecture.Basic[], attend: ISync.AttendType) {
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
}
