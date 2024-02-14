import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { NoticesRepository } from 'src/prisma/repositories/notices.repository';
import { NoticesController } from './notices.controller';
import { NoticesService } from './notices.service';

@Module({
  imports: [PrismaModule],
  controllers: [NoticesController],
  providers: [NoticesService, NoticesRepository],
})
export class NoticesModule {}
