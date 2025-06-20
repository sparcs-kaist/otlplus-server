import { Module } from '@nestjs/common'

import { LectureRepository, WishlistRepository } from '@otl/prisma-client'
import { PrismaModule } from '@otl/prisma-client/prisma.module'

import { LecturesController, v2LecturesController } from './lectures.controller'
import { LecturesService } from './lectures.service'

@Module({
  imports: [PrismaModule],
  controllers: [LecturesController, v2LecturesController],
  providers: [LecturesService, LectureRepository, WishlistRepository],
  exports: [LecturesService],
})
export class LecturesModule {}
