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
import { SyncService } from './sync.service';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Get('defaultSemester')
  @SyncApiKeyAuth()
  async getDefaultSemester() {
    const semester = await this.syncService.getDefaultSemester();
    if (!semester)
      throw new InternalServerErrorException('No default semester in DB');
    return toJsonSemester(semester);
  }

  @Post('scholarDB')
  @SyncApiKeyAuth()
  async syncScholarDB(@Body() body: ISync.ScholarDBBody) {
    return await this.syncService.syncScholarDB(body);
  }
}
