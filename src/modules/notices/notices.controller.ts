import { Controller, Get } from '@nestjs/common';
import { Public } from 'src/common/decorators/skip-auth.decorator';
import { toJsonNoticeBasic } from 'src/common/interfaces/serializer/notices.serializer';
import { NoticesService } from './notices.service';
import { INotice } from '../../common/interfaces/INotice';

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
