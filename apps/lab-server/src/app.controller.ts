import { Controller, Get } from '@nestjs/common'
import { Public } from '@otl/scholar-sync/common/decorators/skip-auth.decorator'

import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  getHello(): string {
    return this.appService.getHello()
  }

  @Get('/api')
  @Public()
  getApiHello(): string {
    return this.appService.getHello()
  }
}
