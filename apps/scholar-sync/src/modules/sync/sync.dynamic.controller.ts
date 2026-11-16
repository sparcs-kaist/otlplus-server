import {
  BadRequestException, Body, Controller, Get, Inject, Logger, Param, Patch, Post, Query,
} from '@nestjs/common'
import { SchedulerRegistry } from '@nestjs/schedule'
import { ApiQuery, ApiSecurity } from '@nestjs/swagger'
import { Public } from '@otl/scholar-sync/common/decorators/skip-auth.decorator'
import { SyncApiKeyAuth } from '@otl/scholar-sync/common/decorators/sync-api-key-auth.decorator'
import { SyncTerm } from '@otl/scholar-sync/common/interfaces/ISync'
import { SCHOLAR_MQ, ScholarMQ } from '@otl/scholar-sync/domain/out/ScholarMQ'
import { STATISTICS_MQ, SyncServerStatisticsMQ } from '@otl/scholar-sync/domain/out/StatisticsMQ'
import { SyncSchedule } from '@otl/scholar-sync/modules/sync/sync.schedule'
import CronTime from 'cron'

@Controller('api/dynamic-sync')
export class SyncDynamicController {
  private readonly logger = new Logger(SyncDynamicController.name)

  constructor(
    private readonly syncSchedule: SyncSchedule,
    private readonly schedulerRegistry: SchedulerRegistry,
    @Inject(SCHOLAR_MQ)
    private readonly SyncMQ: ScholarMQ,
    @Inject(STATISTICS_MQ)
    private readonly StatisticsMQ: SyncServerStatisticsMQ,
  ) {}

  @Get('jobs')
  @Public()
  getCrons() {
    const jobs = this.schedulerRegistry.getCronJobs()
    const jobResults: { key: string, running: boolean, next: string | Date }[] = []
    jobs.forEach((value, key, _map) => {
      let next
      try {
        next = value.nextDate().toJSDate()
      }
      catch (_e) {
        next = 'error: next fire date is in the past!'
      }
      const { running } = value
      jobResults.push({ key, running, next })
      this.logger.log(`job: ${key} -> next: ${next}`)
    })
    return jobResults
  }

  // 자동 동기화가 지금(또는 at 시각에) 어떤 학기를 대상으로 하는지 보여준다. 동기화는 하지 않는다.
  @Get('targets')
  @ApiQuery({
    name: 'at',
    type: String,
    required: false,
    description: 'ISO 8601 시각, 시간대 필수 (예: 2027-01-05T15:00:00+09:00)',
  })
  @ApiSecurity('X-API-KEY')
  @SyncApiKeyAuth()
  async getSyncTargets(@Query('at') at?: string) {
    if (at === undefined) return this.syncSchedule.getSyncTargets()
    // 쿼리 문자열에서 인코딩하지 않은 '+'는 공백으로 들어온다.
    const value = at.trim().replace(' ', '+')
    const isIsoWithZone = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/.test(value)
    const now = new Date(isIsoWithZone ? value : Number.NaN)
    if (Number.isNaN(now.getTime())) {
      throw new BadRequestException('at must be an ISO 8601 time with a zone, e.g. 2027-01-05T15:00:00+09:00')
    }
    return this.syncSchedule.getSyncTargets(now)
  }

  @Post('all')
  @ApiQuery({ name: 'year', type: Number, required: false })
  @ApiQuery({ name: 'semester', type: Number, required: false })
  @ApiQuery({ name: 'interval', type: Number, required: false })
  @ApiSecurity('X-API-KEY')
  @SyncApiKeyAuth()
  async syncAll(@Query() query: SyncTerm) {
    await this.syncSchedule.syncAll(query.year, query.semester, query.interval)
  }

  @Post('scholarDB')
  @ApiQuery({ name: 'year', type: Number, required: false })
  @ApiQuery({ name: 'semester', type: Number, required: false })
  @ApiQuery({ name: 'interval', type: Number, required: false })
  @ApiSecurity('X-API-KEY')
  @SyncApiKeyAuth()
  async syncScholarDB(@Query() query: SyncTerm) {
    await this.syncSchedule.syncScholarDB(query.year, query.semester, query.interval)
  }

  @Post('examtime')
  @ApiQuery({ name: 'year', type: Number, required: false })
  @ApiQuery({ name: 'semester', type: Number, required: false })
  @ApiQuery({ name: 'interval', type: Number, required: false })
  @ApiSecurity('X-API-KEY')
  @SyncApiKeyAuth()
  async syncExamtime(@Query() query: SyncTerm) {
    await this.syncSchedule.syncExamTime(query.year, query.semester, query.interval)
  }

  @Post('classtime')
  @ApiQuery({ name: 'year', type: Number, required: false })
  @ApiQuery({ name: 'semester', type: Number, required: false })
  @ApiQuery({ name: 'interval', type: Number, required: false })
  @ApiSecurity('X-API-KEY')
  @SyncApiKeyAuth()
  async syncClasstime(@Query() query: SyncTerm) {
    await this.syncSchedule.syncClassTime(query.year, query.semester, query.interval)
  }

  @Post('takenLecture')
  @ApiQuery({ name: 'year', type: Number, required: false })
  @ApiQuery({ name: 'semester', type: Number, required: false })
  @ApiQuery({ name: 'interval', type: Number, required: false })
  @ApiSecurity('X-API-KEY')
  @SyncApiKeyAuth()
  async syncTakenLecture(@Query() query: SyncTerm) {
    await this.syncSchedule.syncTakenLecture(query.year, query.semester, query.interval)
  }

  @Post('degree')
  @ApiSecurity('X-API-KEY')
  @SyncApiKeyAuth()
  async syncDegree() {
    await this.syncSchedule.syncDegree()
  }

  @Post('major')
  @ApiSecurity('X-API-KEY')
  @SyncApiKeyAuth()
  async syncMajor() {
    await this.syncSchedule.syncMajor()
  }

  @Post('representativeLecture')
  @ApiSecurity('X-API-KEY')
  @SyncApiKeyAuth()
  async updateRepresentativeLecture() {
    await this.syncSchedule.updateRepresentativeLectures()
  }

  @Post('best-review')
  async syncBestReview() {
    await this.syncSchedule.updateReviews()
  }

  @Patch('toggle/:jobName')
  @ApiSecurity('X-API-KEY')
  @SyncApiKeyAuth()
  async toggleJob(@Param('jobName') jobName: string) {
    const job = this.schedulerRegistry.getCronJob(jobName)
    if (!job) {
      throw new Error(`Job ${jobName} not found`)
    }
    if (job.running) {
      job.stop()
      this.logger.log(`Job ${jobName} stopped`)
    }
    else {
      job.start()
      this.logger.log(`Job ${jobName} started`)
    }
  }

  @Patch('toggleAll')
  @ApiSecurity('X-API-KEY')
  @SyncApiKeyAuth()
  async toggleAllJobs() {
    const jobs = this.schedulerRegistry.getCronJobs()
    jobs.forEach((value, key, _map) => {
      if (value.running) {
        value.stop()
        this.logger.log(`Job ${key} stopped`)
      }
      else {
        value.start()
        this.logger.log(`Job ${key} started`)
      }
    })
  }

  @Patch('reset-cron/:jobName')
  @ApiSecurity('X-API-KEY')
  @SyncApiKeyAuth()
  async cronJob(@Param('jobName') jobName: string, @Body('cron') cron: string) {
    const job = this.schedulerRegistry.getCronJob(jobName)
    if (!job) {
      throw new Error(`Job ${jobName} not found`)
    }
    job.setTime(new CronTime.CronTime(cron))
    this.logger.log(`Job ${jobName} set to ${cron}`)
  }
}
