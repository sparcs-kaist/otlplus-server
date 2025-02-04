import { Body, Controller, Get, Logger, Param, Patch, Query } from '@nestjs/common';
import { SyncService } from '@otl/scholar-sync/modules/sync/sync.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { SyncSchedule } from '@otl/scholar-sync/modules/sync/sync.schedule';
import { SyncApiKeyAuth } from '@otl/scholar-sync/common/decorators/sync-api-key-auth.decorator';
import Cron from 'cron';
import { ISync } from '@otl/api-interface/src/interfaces/ISync';

@Controller('api/dynamic-sync')
export class SyncController {
  private readonly logger = new Logger(SyncController.name);

  constructor(
    private readonly syncSchedule: SyncSchedule,
    private readonly syncService: SyncService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  @Get('jobs')
  getCrons() {
    const jobs = this.schedulerRegistry.getCronJobs();
    const jobResults = [];
    jobs.forEach((value, key, map) => {
      let next;
      try {
        next = value.nextDate().toJSDate();
      } catch (e) {
        next = 'error: next fire date is in the past!';
      }
      jobResults.push({ key, next });
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
    job.setTime(new Cron.CronTime(cron));
    this.logger.log(`Job ${jobName} set to ${cron}`);
  }
}
