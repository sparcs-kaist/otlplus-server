import { Module } from '@nestjs/common'

import { PrismaModule } from '@otl/prisma-client/prisma.module'

import { LecturesController } from './lectures.controller'
import { LecturesService } from './lectures.service'

@Module({
  imports: [PrismaModule],
  controllers: [LecturesController],
  providers: [LecturesService],
  exports: [LecturesService],
})
export class LecturesModule {}
