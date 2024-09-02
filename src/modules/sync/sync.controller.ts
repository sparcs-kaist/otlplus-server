import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ISync } from 'src/common/interfaces/ISync';
import { toJsonSemester } from 'src/common/interfaces/serializer/semester.serializer';
import settings from 'src/settings';
import { SyncService } from './sync.service';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Get('defaultSemester')
  async getDefaultSemester() {
    const semester = await this.syncService.getDefaultSemester();
    if (!semester)
      throw new InternalServerErrorException('No default semester in DB');
    return toJsonSemester(semester);
  }

  @Post('scholarDB')
  async syncScholarDB(@Body() body: ISync.ScholarDBBody) {
    if (body.secret !== settings().syncConfig().secret)
      throw new UnauthorizedException();
    return await this.syncService.syncScholarDB(body.data);
  }
}
