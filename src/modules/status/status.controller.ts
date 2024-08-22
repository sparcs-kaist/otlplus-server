import { Controller, Get } from '@nestjs/common';

@Controller('api/status')
export class StatusController {
  @Get()
  getStatus(): string {
    return 'I am Healthy!';
  }
}
