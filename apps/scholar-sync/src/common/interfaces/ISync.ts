import { IsIn, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { SyncType } from '@prisma/client';

export class CronExpress {
  cron!: string;
}

export class SyncTerm {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  year!: number;

  @IsOptional()
  @IsIn([1, 2, 3, 4])
  @IsNumber()
  @Type(() => Number)
  semester!: 1 | 2 | 3 | 4;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  interval!: number;
}

export type SyncTimeType = typeof SyncType.EXAMTIME | typeof SyncType.CLASSTIME;

export class SyncResultSummaries {
  time!: Date;
  year!: number;
  semester!: number;
  results: SyncResultSummary[] = [];
}

export class SyncResultSummary {
  type!: SyncType;
  created!: number;
  updated!: number;
  skipped!: number;
  deleted!: number;
  errors!: number;
}

export class SyncResultDetails {
  time!: Date;
  semester!: number;
  year!: number;
  results: SyncResultDetail[] = [];
}

export class SyncResultDetail {
  constructor(type: SyncType) {
    this.type = type;
    this.created = [];
    this.updated = [];
    this.skipped = [];
    this.errors = [];
    this.deleted = [];
  }
  type: SyncType;
  created: any[];
  updated: any[];
  skipped: any[];
  errors: any[];
  deleted: any[];
}
