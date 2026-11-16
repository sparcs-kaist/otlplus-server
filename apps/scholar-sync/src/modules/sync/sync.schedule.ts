import { Inject, Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { ScholarApiClient } from '@otl/scholar-sync/clients/scholar/scholar.api.client'
import { SlackNotiService } from '@otl/scholar-sync/clients/slack/slackNoti.service'
import { SyncResultDetails } from '@otl/scholar-sync/common/interfaces/ISync'
import { SyncService } from '@otl/scholar-sync/modules/sync/sync.service'
import {
  isFirstRunOfKstDay,
  selectSyncTargets,
  SemesterKey,
  SyncTargets,
} from '@otl/scholar-sync/modules/sync/sync.target'
import { putPreviousSemester, summarizeSyncResults } from '@otl/scholar-sync/modules/sync/util'
import settings from '@otl/scholar-sync/settings'
import fs from 'fs'
import { WINSTON_MODULE_PROVIDER, WinstonLogger } from 'nest-winston'

/** lecture: 강의 목록(강의·담당 교수)·수업 시간, taken: 수강 내역·시험 시간 */
type SyncTargetKind = 'lecture' | 'taken'

const formatSemesters = (semesters: SemesterKey[]) => (semesters.length ? semesters.map(([y, s]) => `${y}-${s}`).join(', ') : '없음')

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
    disabled: !settings().syncConfig().syncCronAutostart,
  })
  async syncAll(year?: number, semester?: number, interval?: number) {
    if (this.isManualTerm(year, semester, interval)) {
      // 수동 호출: 지정한 학기마다 네 종류를 모두 동기화한다.
      for (const [y, s] of await this.getManualSemesters(year, semester, interval)) {
        await this.runScholarDB(y, s)
        await this.runExamTime(y, s)
        await this.runClassTime(y, s)
        await this.runTakenLecture(y, s)
      }
      await this.syncDegree()
      await this.syncMajor()
      return
    }

    // 자동 동기화: 데이터 종류별로 대상 학기를 따로 고른다.
    const now = new Date()
    const targets = await this.getSyncTargets(now)
    await this.slackNoti.sendSyncNoti(
      `syncAll targets (${targets.today}) — lecture: ${formatSemesters(targets.lectureTargets)} / taken: ${formatSemesters(targets.takenTargets)}`,
    )
    if (targets.warnings.length && isFirstRunOfKstDay(now)) {
      await this.slackNoti.sendSyncNoti(`syncAll warnings:\n${targets.warnings.map((w) => `- ${w}`).join('\n')}`)
    }

    // 수강 내역·시험 시간은 DB의 강의에 연결되므로 강의 목록을 먼저 돌린다.
    for (const [y, s] of targets.lectureTargets) {
      await this.runIsolated(`lecture ${y}-${s}`, async () => {
        await this.runScholarDB(y, s)
        await this.runClassTime(y, s)
      })
    }
    for (const [y, s] of targets.takenTargets) {
      await this.runIsolated(`taken ${y}-${s}`, async () => {
        await this.runExamTime(y, s)
        await this.runTakenLecture(y, s)
      })
    }
    await this.runIsolated('degree', () => this.syncDegree())
    await this.runIsolated('major', () => this.syncMajor())
  }

  @Cron(CronExpression.EVERY_3_HOURS, {
    name: 'syncScholarDB',
    timeZone: 'Asia/Seoul',
    disabled: true,
  })
  async syncScholarDB(year?: number, semester?: number, interval?: number) {
    for (const [y, s] of await this.determineTargetSemesters('lecture', year, semester, interval)) {
      await this.runScholarDB(y, s)
    }
  }

  @Cron(CronExpression.EVERY_3_HOURS, {
    name: 'syncExamTime',
    timeZone: 'Asia/Seoul',
    disabled: true,
  })
  async syncExamTime(year?: number, semester?: number, interval?: number) {
    for (const [y, s] of await this.determineTargetSemesters('taken', year, semester, interval)) {
      await this.runExamTime(y, s)
    }
  }

  @Cron(CronExpression.EVERY_3_HOURS, {
    name: 'syncClassTime',
    timeZone: 'Asia/Seoul',
    disabled: true,
  })
  async syncClassTime(year?: number, semester?: number, interval?: number) {
    for (const [y, s] of await this.determineTargetSemesters('lecture', year, semester, interval)) {
      await this.runClassTime(y, s)
    }
  }

  @Cron(CronExpression.EVERY_3_HOURS, {
    name: 'syncTakenLecture',
    timeZone: 'Asia/Seoul',
    disabled: true,
  })
  async syncTakenLecture(year?: number, semester?: number, interval?: number) {
    for (const [y, s] of await this.determineTargetSemesters('taken', year, semester, interval)) {
      await this.runTakenLecture(y, s)
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

  /** 자동 동기화 대상 학기. 동기화는 하지 않는다. */
  async getSyncTargets(now: Date = new Date()): Promise<SyncTargets> {
    return selectSyncTargets(await this.syncService.getSemestersForSyncTarget(), now)
  }

  private async runScholarDB(year: number, semester: number) {
    const lectures = await this.scholarApiClient.getLectureType(year, semester)
    const charges = await this.scholarApiClient.getChargeType(year, semester)
    const syncResults: SyncResultDetails = await this.syncService.syncScholarDB({
      year,
      semester,
      lectures,
      charges,
    })
    const syncResultSummaries = summarizeSyncResults(syncResults)
    await this.slackNoti.sendSyncNoti(JSON.stringify(syncResultSummaries, null, 2))
    fs.writeFileSync(
      `${this.logFileDir}/scholar-${year}-${semester}-${syncResultSummaries.time.toISOString()}.json`,
      JSON.stringify(syncResults, null, 2),
    )
  }

  private async runExamTime(year: number, semester: number) {
    const examtimes = await this.scholarApiClient.getExamTimeType(year, semester)
    const syncResultDetail = await this.syncService.syncExamTime({ year, semester, examtimes })
    const syncResultSummaries = summarizeSyncResults(syncResultDetail)
    await this.slackNoti.sendSyncNoti(JSON.stringify(syncResultSummaries, null, 2))
    fs.writeFileSync(
      `${this.logFileDir}/examTime-${year}-${semester}-${syncResultSummaries.time.toISOString()}.json`,
      JSON.stringify(syncResultDetail, null, 2),
    )
  }

  private async runClassTime(year: number, semester: number) {
    const classtimes = await this.scholarApiClient.getClassTimeType(year, semester)
    const syncResultDetail = await this.syncService.syncClassTime({ year, semester, classtimes })
    const syncResultSummaries = summarizeSyncResults(syncResultDetail)
    await this.slackNoti.sendSyncNoti(JSON.stringify(syncResultSummaries, null, 2))
    fs.writeFileSync(
      `${this.logFileDir}/classTime-${year}-${semester}-${syncResultSummaries.time.toISOString()}.json`,
      JSON.stringify(syncResultDetail, null, 2),
    )
  }

  private async runTakenLecture(year: number, semester: number) {
    const takenLectures = await this.scholarApiClient.getAttendType(year, semester)
    const syncResultDetail = await this.syncService.syncTakenLecture({ year, semester, attend: takenLectures })
    const syncResultSummaries = summarizeSyncResults(syncResultDetail)
    await this.slackNoti.sendSyncNoti(JSON.stringify(syncResultSummaries, null, 2))
    fs.writeFileSync(
      `${this.logFileDir}/taken_lecture-${year}-${semester}-${syncResultSummaries.time.toISOString()}.json`,
      JSON.stringify(syncResultDetail, null, 2),
    )
  }

  /** 한 작업이 실패해도 자동 동기화의 나머지 작업은 계속한다. (D6) */
  private async runIsolated(label: string, task: () => Promise<void>) {
    try {
      await task()
    }
    catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      this.logger.error(`syncAll failed: ${label}: ${message}`, e instanceof Error ? e.stack : undefined)
      await this.slackNoti.sendSyncNoti(`syncAll failed: ${label}: ${message}`).catch(() => undefined)
    }
  }

  private isManualTerm(year?: number, semester?: number, interval?: number) {
    return Boolean((year && semester) || interval)
  }

  /** 수동 호출의 대상 학기. 오래된 학기부터. */
  private async getManualSemesters(year?: number, semester?: number, interval?: number): Promise<SemesterKey[]> {
    let semesters: SemesterKey[]
    if (year && semester) {
      semesters = [[year, semester]]
      if (interval) {
        putPreviousSemester(semesters, interval)
      }
    }
    else {
      semesters = (await this.syncService.getSemesters(interval)).map((s) => [s.year, s.semester])
    }
    return semesters.reverse()
  }

  private async determineTargetSemesters(
    kind: SyncTargetKind,
    year?: number,
    semester?: number,
    interval?: number,
  ): Promise<SemesterKey[]> {
    if (this.isManualTerm(year, semester, interval)) {
      return this.getManualSemesters(year, semester, interval)
    }
    const targets = await this.getSyncTargets()
    return kind === 'lecture' ? targets.lectureTargets : targets.takenTargets
  }
}
