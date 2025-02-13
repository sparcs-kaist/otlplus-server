import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SyncService } from '@otl/scholar-sync/modules/sync/sync.service';
import { ScholarApiClient } from '@otl/scholar-sync/clients/scholar/scholar.api.client';
import { putPreviousSemester } from '@otl/scholar-sync/modules/sync/util';

@Injectable()
export class SyncSchedule {
  private readonly logger = new Logger(SyncSchedule.name);

  constructor(
    private readonly scholarApiClient: ScholarApiClient,
    private readonly syncService: SyncService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR, {
    name: 'syncAll',
    timeZone: 'Asia/Seoul',
  })
  async syncAll(year?: number, semester?: number, interval?: number) {
    const semesters = await this.determineTargetSemesters(year, semester, interval);
    for (const [year, semester] of [...semesters].reverse()) {
      const lectures = await this.scholarApiClient.getLectureType(year, semester);
      console.log(lectures);
      const charges = await this.scholarApiClient.getChargeType(year, semester);
      console.log(charges);
      const syncResult = await this.syncService.syncScholarDB({ year, semester, lectures, charges });
      this.logger.log(`Synced ${syncResult.lectures.length} lectures and charges for ${year} ${semester}`);

      await Promise.all([
        this.syncExamTime(year, semester),
        this.syncClassTime(year, semester),
        this.syncTakenLecture(year, semester),
        this.syncDegree(),
        this.syncMajor(),
      ]);
    }
  }

  @Cron(CronExpression.EVERY_HOUR, {
    name: 'syncScholarDB',
    timeZone: 'Asia/Seoul',
    disabled: true,
  })
  async syncScholarDB(year?: number, semester?: number, interval?: number) {
    const semesters = await this.determineTargetSemesters(year, semester, interval);
    for (const [year, semester] of [...semesters].reverse()) {
      const lectures = await this.scholarApiClient.getLectureType(year, semester);
      const charges = await this.scholarApiClient.getChargeType(year, semester);
      const syncResult = await this.syncService.syncScholarDB({ year, semester, lectures, charges });
      this.logger.log(`Synced ${syncResult} lectures and charges for ${year} ${semester}`);
    }
  }

  @Cron(CronExpression.EVERY_HOUR, {
    name: 'syncExamTime',
    timeZone: 'Asia/Seoul',
    disabled: true,
  })
  async syncExamTime(year?: number, semester?: number, interval?: number) {
    const semesters = await this.determineTargetSemesters(year, semester, interval);
    for (const [year, semester] of [...semesters].reverse()) {
      const examtimes = await this.scholarApiClient.getExamTimeType(year, semester);
      const syncResultExamTime = await this.syncService.syncExamTime({ year, semester, examtimes });
      this.logger.log(`Synced ${syncResultExamTime.length} examTime for ${year} ${semester}`);
    }
  }

  @Cron(CronExpression.EVERY_HOUR, {
    name: 'syncClassTime',
    timeZone: 'Asia/Seoul',
    disabled: true,
  })
  async syncClassTime(year?: number, semester?: number, interval?: number) {
    const semesters = await this.determineTargetSemesters(year, semester, interval);
    for (const [year, semester] of [...semesters].reverse()) {
      const classtimes = await this.scholarApiClient.getClassTimeType(year, semester);
      const syncResultClassTime = await this.syncService.syncClassTime({ year, semester, classtimes });
      this.logger.log(
        `Synced updated: ${
          syncResultClassTime.updated.length
        }, skipped: ${syncResultClassTime.skipped.length}, errors: ${syncResultClassTime.errors.length}\` classTime for ${year} ${semester}`,
      );
    }
  }

  @Cron(CronExpression.EVERY_HOUR, {
    name: 'syncTakenLecture',
    timeZone: 'Asia/Seoul',
    disabled: true,
  })
  async syncTakenLecture(year?: number, semester?: number, interval?: number) {
    const semesters = await this.determineTargetSemesters(year, semester, interval);
    for (const [year, semester] of [...semesters].reverse()) {
      const takenLectures = await this.scholarApiClient.getAttendType(year, semester);
      const syncResultTakenLecture = await this.syncService.syncTakenLecture({ year, semester, attend: takenLectures });
      this.logger.log(
        `Synced ${
          syncResultTakenLecture.updated.length
        }, skipped: ${syncResultTakenLecture.skipped.length}, errors: ${syncResultTakenLecture.errors.length}\` takenLecture for ${year} ${semester}`,
      );
    }
  }

  @Cron(CronExpression.EVERY_HOUR, {
    name: 'syncDegree',
    timeZone: 'Asia/Seoul',
    disabled: true,
  })
  async syncDegree() {
    const degrees = await this.scholarApiClient.getDegree();
    console.log(degrees);
    await this.syncService.syncDegree(degrees);
  }

  @Cron(CronExpression.EVERY_HOUR, {
    name: 'syncMajor',
    timeZone: 'Asia/Seoul',
    disabled: true,
  })
  async syncMajor() {
    const majors = await this.scholarApiClient.getKdsStudentsOtherMajor();
    console.log(majors);
    await this.syncService.syncOtherMajor(majors);
  }

  @Cron(CronExpression.EVERY_WEEKEND, {
    name: 'syncBestReviews',
    timeZone: 'Asia/Seoul',
    disabled: true,
  })
  async updateReviews() {
    await this.syncService.updateBestReviews();
  }

  private async determineTargetSemesters(year?: number, semester?: number, interval?: number) {
    if (year && semester) {
      const semesters: [number, number][] = [[year, semester]];
      if (interval) {
        putPreviousSemester(semesters, interval);
      }
      return semesters;
    } else if (interval) {
      return (await this.syncService.getSemesters(interval)).map((semester) => [semester.year, semester.semester]);
    } else {
      return (await this.syncService.getSemesters(3)).map((semester) => [semester.year, semester.semester]);
    }
  }
}
