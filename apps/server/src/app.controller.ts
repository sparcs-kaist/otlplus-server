import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorators/skip-auth.decorator';
import { Api } from '@otl/api-interface/src/docs';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  getHello(): string {
    const method = Api.serverNest.App.getHello.apiPath;
    return this.appService.getHello();
  }
}
