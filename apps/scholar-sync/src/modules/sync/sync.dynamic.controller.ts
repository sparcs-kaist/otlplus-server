import { Body, Controller, Get, Logger, Param, Patch, Query } from '@nestjs/common';
import { SyncService } from '@otl/scholar-sync/modules/sync/sync.service';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { SyncSchedule } from '@otl/scholar-sync/modules/sync/sync.schedule';
import { SyncApiKeyAuth } from '@otl/scholar-sync/common/decorators/sync-api-key-auth.decorator';
import CronTime from 'cron';
import { ISync } from '@otl/api-interface/src/interfaces/ISync';
import { Public } from '@otl/scholar-sync/common/decorators/skip-auth.decorator';

@Controller('api/dynamic-sync')
export class SyncDynamicController {
  private readonly logger = new Logger(SyncDynamicController.name);

  constructor(
    private readonly syncSchedule: SyncSchedule,
    private readonly syncService: SyncService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  @Cron('* * 0 * * *', {
    name: 'notifications',
    timeZone: 'Europe/Paris',
  })
  triggerNotifications() {}

  @Get('jobs')
  @Public()
  getCrons() {
    const jobs = this.schedulerRegistry.getCronJobs();
    console.log(jobs);
    const jobResults = [];
    jobs.forEach((value, key, map) => {
      let next;
      try {
        next = value.nextDate().toJSDate();
      } catch (e) {
        next = 'error: next fire date is in the past!';
      }
      const running = value.running;
      jobResults.push({ key, running, next });
      this.logger.log(`job: ${key} -> next: ${next}`);
    });
    return jobResults;
  }

  @Get('all')
  @SyncApiKeyAuth()
  async syncAll(@Query() query: ISync.SyncTerm) {
    await this.syncSchedule.syncAll(query.year, query.semester, query.interval);
  }

  @Get('scholarDB')
  @SyncApiKeyAuth()
  async syncScholarDB(@Query() query: ISync.SyncTerm) {
    await this.syncSchedule.syncScholarDB(query.year, query.semester, query.interval);
  }

  @Get('examtime')
  @SyncApiKeyAuth()
  async syncExamtime(@Query() query: ISync.SyncTerm) {
    await this.syncSchedule.syncExamTime(query.year, query.semester, query.interval);
  }

  @Get('classtime')
  @SyncApiKeyAuth()
  async syncClasstime(@Query() query: ISync.SyncTerm) {
    await this.syncSchedule.syncClassTime(query.year, query.semester, query.interval);
  }

  @Get('takenLecture')
  @SyncApiKeyAuth()
  async syncTakenLecture(@Query() query: ISync.SyncTerm) {
    await this.syncSchedule.syncTakenLecture(query.year, query.semester, query.interval);
  }

  @Patch('toggle/:jobName')
  @SyncApiKeyAuth()
  async toggleJob(@Param('jobName') jobName: string) {
    const job = this.schedulerRegistry.getCronJob(jobName);
    if (!job) {
      throw new Error(`Job ${jobName} not found`);
    }
    if (job.running) {
      job.stop();
      this.logger.log(`Job ${jobName} stopped`);
    } else {
      job.start();
      this.logger.log(`Job ${jobName} started`);
    }
  }

  @Patch('toggleAll')
  @SyncApiKeyAuth()
  async toggleAllJobs() {
    const jobs = this.schedulerRegistry.getCronJobs();
    jobs.forEach((value, key, map) => {
      if (value.running) {
        value.stop();
        this.logger.log(`Job ${key} stopped`);
      } else {
        value.start();
        this.logger.log(`Job ${key} started`);
      }
    });
  }

  @Patch('reset-cron/:jobName')
  @SyncApiKeyAuth()
  async cronJob(@Param('jobName') jobName: string, @Body('cron') cron: string) {
    const job = this.schedulerRegistry.getCronJob(jobName);
    if (!job) {
      throw new Error(`Job ${jobName} not found`);
    }
    job.setTime(new CronTime.CronTime(cron));
    this.logger.log(`Job ${jobName} set to ${cron}`);
  }
}
