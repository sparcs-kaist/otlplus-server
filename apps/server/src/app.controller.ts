import { Controller, Get } from '@nestjs/common'

import { AppService } from './app.service'
import { Public } from './common/decorators/skip-auth.decorator'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  @Public()
  getHello(): string {
    return this.appService.getHello()
  }
}
