import { Controller, Post } from '@nestjs/common';
import { ScholarService } from './scholar.service';

@Controller('scholar')
export class ScholarController {
  constructor(private readonly scholarService: ScholarService) {}

  @Post('receiveData')
  async receiveData() {
    return await this.scholarService.receiveData();
  }
}
