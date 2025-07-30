import {
  Body, Controller, Get, InternalServerErrorException, Param, Post, Query,
} from '@nestjs/common'
import { GetUser } from '@otl/server-nest/common/decorators/get-user.decorator'
import { SyncApiKeyAuth } from '@otl/server-nest/common/decorators/sync-api-key-auth.decorator'
import { ISemester } from '@otl/server-nest/common/interfaces'
import { ISync } from '@otl/server-nest/common/interfaces/ISync'
import { toJsonSemester } from '@otl/server-nest/common/serializer/semester.serializer'
import { session_userprofile } from '@prisma/client'
import { StatusCodes } from 'http-status-codes'

import { getCurrentMethodName } from '@otl/common'
import { UserException } from '@otl/common/exception/user.exception'

import { SyncScholarDBService } from './syncScholarDB.service'
import { SyncTakenLectureService } from './syncTakenLecture.service'

@Controller('api/sync')
export class SyncController {
  constructor(
    private readonly syncScholarDBService: SyncScholarDBService,
    private readonly syncTakenLectureService: SyncTakenLectureService,
  ) {}

  @Get('defaultSemester')
  @SyncApiKeyAuth()
  async getDefaultSemester(): Promise<ISemester.Response> {
    const semester = await this.syncScholarDBService.getDefaultSemester()
    if (!semester) throw new InternalServerErrorException('No default semester in DB')
    return toJsonSemester(semester)
  }

  @Post('scholarDB')
  @SyncApiKeyAuth()
  async syncScholarDB(@Body() body: ISync.ScholarDBBody) {
    return await this.syncScholarDBService.syncScholarDB(body)
  }

  @Post('examtime')
  @SyncApiKeyAuth()
  async syncExamtime(@Body() body: ISync.ExamtimeBody) {
    return await this.syncScholarDBService.syncExamtime(body)
  }

  @Post('classtime')
  @SyncApiKeyAuth()
  async syncClasstime(@Body() body: ISync.ClasstimeBody) {
    return await this.syncScholarDBService.syncClassTime(body)
  }

  @Post('takenLecture')
  @SyncApiKeyAuth()
  async syncTakenLecture(@Body() body: ISync.TakenLectureBody) {
    return await this.syncTakenLectureService.syncTakenLecture(body)
  }

  @Post('requests')
  async postNewSyncRequest(@Body() body: ISync.TakenLectureSyncBody, @GetUser() user: session_userprofile) {
    const studentId = user.student_id
    if (!studentId) {
      throw new UserException(StatusCodes.BAD_REQUEST, UserException.NO_STUDENT_ID, getCurrentMethodName())
    }
    return await this.syncTakenLectureService.createRequest(body.year, body.semester, parseInt(studentId))
  }

  @Get('requests/active/:requestId')
  async getActiveSyncRequest(@GetUser() user: session_userprofile, @Param('requestId') requestId: string) {
    const studentId = user.student_id
    if (!studentId) {
      throw new UserException(StatusCodes.BAD_REQUEST, UserException.NO_STUDENT_ID, getCurrentMethodName())
    }
    return await this.syncTakenLectureService.getActiveSyncRequest(requestId)
  }

  @Get('requests/active')
  async getSyncRequests(@GetUser() user: session_userprofile, @Query() query: ISync.TakenLectureSyncQuery) {
    const studentId = user.student_id
    if (!studentId) {
      throw new UserException(StatusCodes.BAD_REQUEST, UserException.NO_STUDENT_ID, getCurrentMethodName())
    }
    return await this.syncTakenLectureService.getSyncRequests(query.year, query.semester, parseInt(studentId))
  }
}
