import { Inject, Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { ScholarApiClient } from '@otl/scholar-sync/clients/scholar/scholar.api.client'
import { SlackNotiService } from '@otl/scholar-sync/clients/slack/slackNoti.service'
import { SyncResultDetails } from '@otl/scholar-sync/common/interfaces/ISync'
import { SyncService } from '@otl/scholar-sync/modules/sync/sync.service'
import { putPreviousSemester, summarizeSyncResults } from '@otl/scholar-sync/modules/sync/util'
import settings from '@otl/scholar-sync/settings'
import fs from 'fs'
import { WINSTON_MODULE_PROVIDER, WinstonLogger } from 'nest-winston'

@Injectable()
export class SyncSchedule {
  private readonly logger = new Logger(SyncSchedule.name)

  private readonly logFileDir = `${settings().loggingConfig().logDir}/${process.env.NODE_ENV}`

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly winstonLogger: WinstonLogger,
    private readonly scholarApiClient: ScholarApiClient,
    private readonly syncService: SyncService,
    private readonly slackNoti: SlackNotiService,
  ) {
    if (!fs.existsSync(this.logFileDir)) {
      fs.mkdirSync(this.logFileDir, { recursive: true })
    }
    console.log(this.logFileDir)
  }

  @Cron(CronExpression.EVERY_3_HOURS, {
    name: 'syncAll',
    timeZone: 'Asia/Seoul',
    // temp: rate limit 테스트를 위해 임시로 비활성화
    disabled: true,
  })
  async syncAll(year?: number, semester?: number, interval?: number) {
    const semesters = await this.determineTargetSemesters(year, semester, interval)
    for (const [y, s] of [...semesters].reverse()) {
      const lectures = await this.scholarApiClient.getLectureType(y, s)
      const charges = await this.scholarApiClient.getChargeType(y, s)
      const syncResults: SyncResultDetails = await this.syncService.syncScholarDB({
        year: y,
        semester: s,
        lectures,
        charges,
      })
      const syncResultSummaries = summarizeSyncResults(syncResults)
      await this.slackNoti.sendSyncNoti(JSON.stringify(syncResultSummaries, null, 2))
      fs.writeFileSync(
        `${this.logFileDir}/scholar-${year}-${semester}-${syncResultSummaries.time.toISOString()}.json`,
        JSON.stringify(syncResults, null, 2),
      )
      await this.syncExamTime(year, semester)
      await this.syncClassTime(year, semester)
      await this.syncTakenLecture(year, semester)
    }
    await this.syncDegree()
    await this.syncMajor()
  }

  @Cron(CronExpression.EVERY_3_HOURS, {
    name: 'syncScholarDB',
    timeZone: 'Asia/Seoul',
    disabled: true,
  })
  async syncScholarDB(year?: number, semester?: number, interval?: number) {
    const semesters = await this.determineTargetSemesters(year, semester, interval)
    for (const [y, s] of [...semesters].reverse()) {
      const lectures = await this.scholarApiClient.getLectureType(y, s)
      const charges = await this.scholarApiClient.getChargeType(y, s)
      const syncResultDetails: SyncResultDetails = await this.syncService.syncScholarDB({
        year: y,
        semester: s,
        lectures,
        charges,
      })
      const syncResultSummaries = summarizeSyncResults(syncResultDetails)
      await this.slackNoti.sendSyncNoti(JSON.stringify(syncResultSummaries, null, 2))
      fs.writeFileSync(
        `${this.logFileDir}/scholar-${syncResultSummaries.time.toISOString()}.json`,
        JSON.stringify(syncResultDetails, null, 2),
      )
    }
  }

  @Cron(CronExpression.EVERY_3_HOURS, {
    name: 'syncExamTime',
    timeZone: 'Asia/Seoul',
    disabled: true,
  })
  async syncExamTime(year?: number, semester?: number, interval?: number) {
    const semesters = await this.determineTargetSemesters(year, semester, interval)
    for (const [y, s] of [...semesters].reverse()) {
      const examtimes = await this.scholarApiClient.getExamTimeType(y, s)
      const syncResultDetail = await this.syncService.syncExamTime({ year: y, semester: s, examtimes })
      const syncResultSummaries = summarizeSyncResults(syncResultDetail)
      await this.slackNoti.sendSyncNoti(JSON.stringify(syncResultSummaries, null, 2))
      fs.writeFileSync(
        `${this.logFileDir}/examTime-${year}-${semester}-${syncResultSummaries.time.toISOString()}.json`,
        JSON.stringify(syncResultDetail, null, 2),
      )
    }
  }

  @Cron(CronExpression.EVERY_3_HOURS, {
    name: 'syncClassTime',
    timeZone: 'Asia/Seoul',
    disabled: true,
  })
  async syncClassTime(year?: number, semester?: number, interval?: number) {
    const semesters = await this.determineTargetSemesters(year, semester, interval)
    for (const [y, s] of [...semesters].reverse()) {
      const classtimes = await this.scholarApiClient.getClassTimeType(y, s)
      const syncResultDetail = await this.syncService.syncClassTime({ year: y, semester: s, classtimes })
      const syncResultSummaries = summarizeSyncResults(syncResultDetail)
      await this.slackNoti.sendSyncNoti(JSON.stringify(syncResultSummaries, null, 2))
      fs.writeFileSync(
        `${this.logFileDir}/classTime-${year}-${semester}-${syncResultSummaries.time.toISOString()}.json`,
        JSON.stringify(syncResultDetail, null, 2),
      )
    }
  }

  @Cron(CronExpression.EVERY_3_HOURS, {
    name: 'syncTakenLecture',
    timeZone: 'Asia/Seoul',
    disabled: true,
  })
  async syncTakenLecture(year?: number, semester?: number, interval?: number) {
    const semesters = await this.determineTargetSemesters(year, semester, interval)
    for (const [y, s] of [...semesters].reverse()) {
      const takenLectures = await this.scholarApiClient.getAttendType(y, s)
      const syncResultDetail = await this.syncService.syncTakenLecture({ year: y, semester: s, attend: takenLectures })
      const syncResultSummaries = summarizeSyncResults(syncResultDetail)
      await this.slackNoti.sendSyncNoti(JSON.stringify(syncResultSummaries, null, 2))
      fs.writeFileSync(
        `${this.logFileDir}/taken_lecture-${year}-${semester}-${syncResultSummaries.time.toISOString()}.json`,
        JSON.stringify(syncResultDetail, null, 2),
      )
    }
  }

  @Cron(CronExpression.EVERY_3_HOURS, {
    name: 'syncDegree',
    timeZone: 'Asia/Seoul',
    disabled: true,
  })
  async syncDegree() {
    const degrees = await this.scholarApiClient.getDegree()
    const syncResultDetail = await this.syncService.syncDegree(degrees)
    const syncResultSummaries = summarizeSyncResults(syncResultDetail)
    await this.slackNoti.sendSyncNoti(JSON.stringify(syncResultSummaries, null, 2))
    fs.writeFileSync(
      `${this.logFileDir}/degree-${syncResultSummaries.time.toISOString()}.json`,
      JSON.stringify(syncResultDetail, null, 2),
    )
  }

  @Cron(CronExpression.EVERY_3_HOURS, {
    name: 'syncMajor',
    timeZone: 'Asia/Seoul',
    disabled: true,
  })
  async syncMajor() {
    const majors = await this.scholarApiClient.getKdsStudentsOtherMajor()
    const syncResultDetail = await this.syncService.syncOtherMajor(majors)
    const syncResultSummaries = summarizeSyncResults(syncResultDetail)
    await this.slackNoti.sendSyncNoti(JSON.stringify(syncResultSummaries, null, 2))
    fs.writeFileSync(
      `${this.logFileDir}/major-${syncResultSummaries.time.toISOString()}.json`,
      JSON.stringify(syncResultDetail, null, 2),
    )
  }

  @Cron(CronExpression.EVERY_WEEKEND, {
    name: 'syncBestReviews',
    timeZone: 'Asia/Seoul',
    disabled: false,
  })
  async updateReviews() {
    await this.syncService.updateBestReviews()
  }

  @Cron(CronExpression.EVERY_WEEKEND, {
    name: 'syncRepresentativeLectures',
    timeZone: 'Asia/Seoul',
    disabled: false,
  })
  async updateRepresentativeLectures() {
    await this.syncService.updateRepresentativeLectures()
  }

  private async determineTargetSemesters(year?: number, semester?: number, interval?: number) {
    if (year && semester) {
      const semesters: [number, number][] = [[year, semester]]
      if (interval) {
        putPreviousSemester(semesters, interval)
      }
      return semesters
    }
    if (interval) {
      return (await this.syncService.getSemesters(interval)).map((s) => [s.year, s.semester])
    }
    return (await this.syncService.getSemesters(1)).map((s) => [s.year, s.semester])
  }
}
