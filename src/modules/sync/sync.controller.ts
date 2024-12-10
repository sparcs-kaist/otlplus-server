import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { SyncApiKeyAuth } from '@src/common/decorators/sync-api-key-auth.decorator';
import { ISync } from 'src/common/interfaces/ISync';
import { toJsonSemester } from 'src/common/interfaces/serializer/semester.serializer';
import { SyncScholarDBService } from './syncScholarDB.service';
import { SyncTakenLectureService } from './syncTakenLecture.service';

@Controller('sync')
export class SyncController {
  constructor(
    private readonly syncScholarDBService: SyncScholarDBService,
    private readonly syncTakenLectureService: SyncTakenLectureService,
  ) {}

  @Get('defaultSemester')
  @SyncApiKeyAuth()
  async getDefaultSemester() {
    const semester = await this.syncScholarDBService.getDefaultSemester();
    if (!semester)
      throw new InternalServerErrorException('No default semester in DB');
    return toJsonSemester(semester);
  }

  @Post('scholarDB')
  @SyncApiKeyAuth()
  async syncScholarDB(@Body() body: ISync.ScholarDBBody) {
    return await this.syncScholarDBService.syncScholarDB(body);
  }

  @Post('examtime')
  @SyncApiKeyAuth()
  async syncExamtime(@Body() body: ISync.ExamtimeBody) {
    return await this.syncScholarDBService.syncExamtime(body);
  }

  @Post('classtime')
  @SyncApiKeyAuth()
  async syncClasstime(@Body() body: ISync.ClasstimeBody) {
    return await this.syncScholarDBService.syncClassTime(body);
  }

  @Post('takenLecture')
  @SyncApiKeyAuth()
  async syncTakenLecture(@Body() body: ISync.TakenLectureBody) {
    return await this.syncTakenLectureService.syncTakenLecture(body);
  }
}
