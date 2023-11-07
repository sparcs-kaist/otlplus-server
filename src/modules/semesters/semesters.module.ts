import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { SemestersController } from './semesters.controller';
import { SemestersService } from './semesters.service';

@Module({
  imports: [PrismaModule],
  controllers: [SemestersController],
  providers: [SemestersService],
})
export class SemestersModule {}
