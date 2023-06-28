import { Module } from '@nestjs/common';
import { SemestersController } from './semesters.controller';
import { SemestersService } from './semesters.service';

@Module({
  controllers: [SemestersController],
  providers: [SemestersService]
})
export class SemestersModule {}
