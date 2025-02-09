import { Controller, Get } from '@nestjs/common';
import { Public } from '@src/common/decorators/skip-auth.decorator';
import { NoticesService } from './notices.service';
import { toJsonNoticeBasic } from '@src/common/serializer/notices.serializer';
import { INotice } from '@otl/api-interface/src/interfaces';

@Controller('api/notices')
export class NoticesController {
  constructor(private readonly noticesService: NoticesService) {}

  @Public()
  @Get()
  async getNotices(): Promise<INotice.Basic[]> {
    const notices = await this.noticesService.getNotices();

    return notices.map(toJsonNoticeBasic);
  }
}
