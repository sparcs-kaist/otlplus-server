import { Injectable } from '@nestjs/common';
import { ELecture } from '@src/common/entities/ELecture';
import { ETakenLecture } from '@src/common/entities/ETakenLecture';
import { ISync } from '@src/common/interfaces/ISync';
import { SyncRepository } from 'src/prisma/repositories/sync.repository';
import { SlackNotiService } from './slackNoti.service';

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

    const existingLectures =
      await this.syncRepository.getExistingDetailedLectures({
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
    const studentIds = new Set([
      ...data.attend.map((a) => a.student_no),
      ...existingUserTakenLectures.map((u) => parseInt(u.student_id)),
    ]);
    const studentPairMap = new Map<number, [ETakenLecture.Basic[], number[]]>();
    for (const studentId of studentIds) {
      studentPairMap.set(studentId, [[], []]);
    }
    for (const user of existingUserTakenLectures) {
      const student_id = parseInt(user.student_id);
      studentPairMap.get(student_id)![0] = user.taken_lectures;
    }
    for (const attend of data.attend) {
      const lectureId = this.getLectureIdOfAttendRecord(
        existingLectures,
        attend,
      );
      if (lectureId) studentPairMap.get(attend.student_no)![1].push(lectureId);
      else
        result.errors.push({
          student_no: attend.student_no,
          attend,
          error: 'lecture not found',
        });
    }

    const saveToDB = [];
    for (const [
      studentId,
      [existingTakenLectures, attendRecords],
    ] of studentPairMap) {
      try {
        const recordIdsToRemove = [];
        const recordsToAdd = [...attendRecords];
        for (const existing of existingTakenLectures) {
          const idx = recordsToAdd.indexOf(existing.lecture_id);
          if (idx === -1) recordIdsToRemove.push(existing.id);
          else recordsToAdd.splice(idx, 1);
        }
        if (recordIdsToRemove.length || recordsToAdd.length) {
          await this.syncRepository.updateTakenLectures(studentId, {
            remove: recordIdsToRemove,
            add: recordsToAdd,
          });
          result.updated.push({
            studentId,
            remove: recordIdsToRemove,
            add: recordsToAdd,
          });
        }
        if (attendRecords.length)
          saveToDB.push(
            ...attendRecords.map((lectureId) => ({
              studentId,
              lectureId,
            })),
          );
      } catch (e: any) {
        result.errors.push({ studentId, error: e.message || 'Unknown error' });
      }
    }

    await this.syncRepository.replaceRawTakenLectures(saveToDB, {
      year: data.year,
      semester: data.semester,
    });

    this.slackNoti.sendSyncNoti(
      `syncTakenLecture: ${result.updated.length} updated, ${result.errors.length} errors`,
    );

    return result;
  }

  getLectureIdOfAttendRecord(
    lectures: ELecture.Basic[],
    attend: ISync.AttendType,
  ) {
    const lecture = lectures.find(
      (l) =>
        l.code === attend.subject_no &&
        l.class_no === attend.lecture_class.trim(),
    );
    return lecture?.id;
  }

  async repopulateTakenLectureForStudent(userId: number) {
    const user = await this.syncRepository.getUserWithId(userId);
    if (!user) throw new Error('User not found');
    const studentId = parseInt(user.student_id);
    if (Number.isNaN(studentId)) return; // Skip if student_id is not a number
    const rawTakenLectures =
      await this.syncRepository.getRawTakenLecturesOfStudent(studentId);
    await this.syncRepository.repopulateTakenLecturesOfUser(
      studentId,
      rawTakenLectures,
    );
  }
}
