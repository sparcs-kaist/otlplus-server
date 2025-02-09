import { Body, Controller, Get, InternalServerErrorException, Post } from '@nestjs/common';
import { SyncApiKeyAuth } from '@otl/scholar-sync/common/decorators/sync-api-key-auth.decorator';
import { toJsonSemester } from '@otl/scholar-sync/common/serializer/semester.serializer';
import { SyncService } from '@otl/scholar-sync/modules/sync/sync.service';
import { IScholar } from '@otl/scholar-sync/clients/scholar/IScholar';

@Controller('api/sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Get('defaultSemester')
  @SyncApiKeyAuth()
  async getDefaultSemester() {
    const semester = await this.syncService.getDefaultSemester();
    if (!semester) throw new InternalServerErrorException('No default semester in DB');
    return toJsonSemester(semester);
  }

  @Post('scholarDB')
  @SyncApiKeyAuth()
  async syncScholarDB(@Body() body: IScholar.ScholarDBBody) {
    return await this.syncService.syncScholarDB(body);
  }

  @Post('examtime')
  @SyncApiKeyAuth()
  async syncExamtime(@Body() body: IScholar.ExamtimeBody) {
    return await this.syncService.syncExamTime(body);
  }

  @Post('classtime')
  @SyncApiKeyAuth()
  async syncClasstime(@Body() body: IScholar.ClasstimeBody) {
    return await this.syncService.syncClassTime(body);
  }

  @Post('takenLecture')
  @SyncApiKeyAuth()
  async syncTakenLecture(@Body() body: IScholar.TakenLectureBody) {
    return await this.syncService.syncTakenLecture(body);
  }
}
