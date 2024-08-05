import { Module } from '@nestjs/common';
import { ScholarController } from './scholar.controller';
import { ScholarService } from './scholar.service';

@Module({
  controllers: [ScholarController],
  providers: [ScholarService],
})
export class ScholarModule {}
