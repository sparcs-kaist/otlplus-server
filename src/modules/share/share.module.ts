import { Module } from '@nestjs/common';
import { ShareController } from './share.controller';
import { ShareService } from './share.service';
import { TimetablesModule } from '../timetables/timetables.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule, TimetablesModule],
  controllers: [ShareController],
  providers: [ShareService],
})
export class ShareModule {}
