import { Controller, Get } from '@nestjs/common'
import { Public } from '@otl/server-nest/common/decorators/skip-auth.decorator'
import { INotice } from '@otl/server-nest/common/interfaces'
import { toJsonNoticeBasic } from '@otl/server-nest/common/serializer/notices.serializer'

import { NoticesService } from './notices.service'

@Controller('api/notices')
export class NoticesController {
  constructor(private readonly noticesService: NoticesService) {}

  @Public()
  @Get()
  async getNotices(): Promise<INotice.Basic[]> {
    const notices = await this.noticesService.getNotices()

    return notices.map(toJsonNoticeBasic)
  }
}
