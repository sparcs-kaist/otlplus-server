import { Module } from '@nestjs/common'

import { PrismaModule } from '@otl/prisma-client/prisma.module'

import { FeedsController } from './feeds.controller'
import { FeedsService } from './feeds.service'

@Module({
  imports: [PrismaModule],
  controllers: [FeedsController],
  providers: [FeedsService],
  exports: [FeedsService],
})
export class FeedsModule {}
