import { Controller, Get } from '@nestjs/common';

@Controller('api/status')
export class StatusController {
  @Get()
  getStatus() {
    return 'I am Healthy!';
  }
}
