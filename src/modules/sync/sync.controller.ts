import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { ISync } from 'src/common/interfaces/ISync';
import settings from 'src/settings';
import { SyncService } from './sync.service';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('scholarDB')
  async syncScholarDB(@Body() body: ISync.ScholarDBBody) {
    if (body.secret !== settings().syncConfig().secret)
      throw new UnauthorizedException();
    return await this.syncService.syncScholarDB(body.data);
  }
}
