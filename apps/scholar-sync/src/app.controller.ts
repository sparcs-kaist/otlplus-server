import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from '@otl/scholar-sync/common/decorators/skip-auth.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/api')
  @Public()
  getApiHello(): string {
    return this.appService.getHello();
  }
}
