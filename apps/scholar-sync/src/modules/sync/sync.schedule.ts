import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ScholarApiClient } from '@otl/scholar-sync/clients/scholar/scholar.api.client';
import { SlackNotiService } from '@otl/scholar-sync/clients/slack/slackNoti.service';
import { SyncService } from '@otl/scholar-sync/modules/sync/sync.service';
import { putPreviousSemester, summarizeSyncResults } from '@otl/scholar-sync/modules/sync/util';
import settings from '@otl/scholar-sync/settings';
import fs from 'fs';
import { WINSTON_MODULE_PROVIDER, WinstonLogger } from 'nest-winston';
import { SyncResultDetails } from '@otl/scholar-sync/common/interfaces/ISync';

@Injectable()
export class SyncSchedule {
  private readonly logger = new Logger(SyncSchedule.name);
  private readonly logFileDir = settings().loggingConfig().logDir + `/${process.env.NODE_ENV}`;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly winstonLogger: WinstonLogger,
    private readonly scholarApiClient: ScholarApiClient,
    private readonly syncService: SyncService,
    private readonly slackNoti: SlackNotiService,
  ) {
    if (!fs.existsSync(this.logFileDir)) {
      fs.mkdirSync(this.logFileDir, { recursive: true });
    }
    console.log(this.logFileDir);
  }

  @Cron(CronExpression.EVERY_HOUR, {
    name: 'syncAll',
    timeZone: 'Asia/Seoul',
  })
  async syncAll(year?: number, semester?: number, interval?: number) {
    const semesters = await this.determineTargetSemesters(year, semester, interval);
    for (const [year, semester] of [...semesters].reverse()) {
      const lectures = await this.scholarApiClient.getLectureType(year, semester);
      const charges = await this.scholarApiClient.getChargeType(year, semester);
      const syncResults: SyncResultDetails = await this.syncService.syncScholarDB({
        year,
        semester,
        lectures,
        charges,
      });
      const syncResultSummaries = summarizeSyncResults(syncResults);
      await this.slackNoti.sendSyncNoti(JSON.stringify(syncResultSummaries, null, 2));
      fs.writeFileSync(
        `${this.logFileDir}/scholar-${year}-${semester}-${syncResultSummaries.time.toISOString()}.json`,
        JSON.stringify(syncResults, null, 2),
      );
      await this.syncExamTime(year, semester);
      await this.syncClassTime(year, semester);
      await this.syncTakenLecture(year, semester);
      await this.syncDegree();
      await this.syncMajor();
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
      const syncResultDetails: SyncResultDetails = await this.syncService.syncScholarDB({
        year,
        semester,
        lectures,
        charges,
      });
      const syncResultSummaries = summarizeSyncResults(syncResultDetails);
      await this.slackNoti.sendSyncNoti(JSON.stringify(syncResultSummaries, null, 2));
      fs.writeFileSync(
        `${this.logFileDir}/scholar-${syncResultSummaries.time.toISOString()}.json`,
        JSON.stringify(syncResultDetails, null, 2),
      );
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
      const syncResultDetail = await this.syncService.syncExamTime({ year, semester, examtimes });
      const syncResultSummaries = summarizeSyncResults(syncResultDetail);
      await this.slackNoti.sendSyncNoti(JSON.stringify(syncResultSummaries, null, 2));
      fs.writeFileSync(
        `${this.logFileDir}/examTime-${year}-${semester}-${syncResultSummaries.time.toISOString()}.json`,
        JSON.stringify(syncResultDetail, null, 2),
      );
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
      const syncResultDetail = await this.syncService.syncClassTime({ year, semester, classtimes });
      const syncResultSummaries = summarizeSyncResults(syncResultDetail);
      await this.slackNoti.sendSyncNoti(JSON.stringify(syncResultSummaries, null, 2));
      fs.writeFileSync(
        `${this.logFileDir}/classTime-${year}-${semester}-${syncResultSummaries.time.toISOString()}.json`,
        JSON.stringify(syncResultDetail, null, 2),
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
      const syncResultDetail = await this.syncService.syncTakenLecture({ year, semester, attend: takenLectures });
      const syncResultSummaries = summarizeSyncResults(syncResultDetail);
      await this.slackNoti.sendSyncNoti(JSON.stringify(syncResultSummaries, null, 2));
      fs.writeFileSync(
        `${this.logFileDir}/taken_lecture-${year}-${semester}-${syncResultSummaries.time.toISOString()}.json`,
        JSON.stringify(syncResultDetail, null, 2),
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
    const syncResultDetail = await this.syncService.syncDegree(degrees);
    const syncResultSummaries = summarizeSyncResults(syncResultDetail);
    await this.slackNoti.sendSyncNoti(JSON.stringify(syncResultSummaries, null, 2));
    fs.writeFileSync(
      `${this.logFileDir}/degree-${syncResultSummaries.time.toISOString()}.json`,
      JSON.stringify(syncResultDetail, null, 2),
    );
  }

  @Cron(CronExpression.EVERY_HOUR, {
    name: 'syncMajor',
    timeZone: 'Asia/Seoul',
    disabled: true,
  })
  async syncMajor() {
    const majors = await this.scholarApiClient.getKdsStudentsOtherMajor();
    const syncResultDetail = await this.syncService.syncOtherMajor(majors);
    const syncResultSummaries = summarizeSyncResults(syncResultDetail);
    await this.slackNoti.sendSyncNoti(JSON.stringify(syncResultSummaries, null, 2));
    fs.writeFileSync(
      `${this.logFileDir}/major-${syncResultSummaries.time.toISOString()}.json`,
      JSON.stringify(syncResultDetail, null, 2),
    );
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
