import { Type } from 'class-transformer'
import {
  IsBoolean, IsIn, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, Max, Min,
} from 'class-validator'

import { AgreementType } from '@otl/common/enum/agreement'

export namespace IPushNotification {
  // --- Admin DTOs ---

  export class CreateDto {
    @IsNotEmpty()
    @IsString()
    name!: string

    @IsNotEmpty()
    @IsIn(Object.values(AgreementType))
    type!: string

    @IsNotEmpty()
    @IsString()
    titleTemplate!: string

    @IsNotEmpty()
    @IsString()
    bodyTemplate!: string

    @IsNotEmpty()
    @IsIn(['ALL', 'SEGMENT', 'MANUAL'])
    targetType!: string

    @IsOptional()
    @IsObject()
    targetFilter?: Record<string, unknown> | null

    @IsNotEmpty()
    @IsIn(['IMMEDIATE', 'ONE_TIME', 'CRON'])
    scheduleType!: string

    @IsOptional()
    scheduleAt?: Date | null

    @IsOptional()
    @IsString()
    cronExpression?: string | null

    @IsOptional()
    @IsIn(['URGENT', 'NORMAL', 'LOW'])
    priority?: string

    @IsOptional()
    @IsString()
    digestKey?: string | null

    @IsOptional()
    @IsInt()
    digestWindowSec?: number | null

    @IsOptional()
    @IsBoolean()
    isActive?: boolean
  }

  export class UpdateDto {
    @IsOptional()
    @IsString()
    name?: string

    @IsOptional()
    @IsIn(Object.values(AgreementType))
    type?: string

    @IsOptional()
    @IsString()
    titleTemplate?: string

    @IsOptional()
    @IsString()
    bodyTemplate?: string

    @IsOptional()
    @IsIn(['ALL', 'SEGMENT', 'MANUAL'])
    targetType?: string

    @IsOptional()
    @IsObject()
    targetFilter?: Record<string, unknown> | null

    @IsOptional()
    @IsIn(['IMMEDIATE', 'ONE_TIME', 'CRON'])
    scheduleType?: string

    @IsOptional()
    scheduleAt?: Date | null

    @IsOptional()
    @IsString()
    cronExpression?: string | null

    @IsOptional()
    @IsIn(['URGENT', 'NORMAL', 'LOW'])
    priority?: string

    @IsOptional()
    @IsString()
    digestKey?: string | null

    @IsOptional()
    @IsInt()
    digestWindowSec?: number | null

    @IsOptional()
    @IsBoolean()
    isActive?: boolean
  }

  export class SendDto {
    @IsOptional()
    @IsObject()
    templateVars?: Record<string, string>
  }

  // --- User Preference DTOs ---

  export class UpdatePreferencesDto {
    @IsOptional()
    @IsBoolean()
    info?: boolean

    @IsOptional()
    @IsBoolean()
    marketing?: boolean

    @IsOptional()
    @IsBoolean()
    nightMarketing?: boolean
  }

  export class UpdateDetailPreferenceDto {
    @IsNotEmpty()
    @IsString()
    notificationName!: string

    @IsNotEmpty()
    @IsBoolean()
    active!: boolean
  }

  export class HistoryQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    cursor?: number

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number
  }
}
