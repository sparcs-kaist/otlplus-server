import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/decorators/skip-auth.decorator';

@Controller('api/status')
export class StatusController {
  @Get()
  @Public()
  getStatus(): string {
    return 'I am Healthy!';
  }
}
