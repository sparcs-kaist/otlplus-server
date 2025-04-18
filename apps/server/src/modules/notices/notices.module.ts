import { Module } from '@nestjs/common'

import { PrismaModule } from '@otl/prisma-client/prisma.module'

import { NoticesController } from './notices.controller'
import { NoticesService } from './notices.service'

@Module({
  imports: [PrismaModule],
  controllers: [NoticesController],
  providers: [NoticesService],
})
export class NoticesModule {}
