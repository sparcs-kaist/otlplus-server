import { Module } from '@nestjs/common';
import { NoticesController } from './notices.controller';
import { NoticesService } from './notices.service';
import { PrismaModule } from '@otl/prisma-client/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NoticesController],
  providers: [NoticesService],
})
export class NoticesModule {}
