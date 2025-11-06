import { Module } from '@nestjs/common'

import { PrismaModule } from '@otl/prisma-client/prisma.module'

import { LecturesController } from './lectures.controller'
import { LecturesService } from './lectures.service'
import { LecturesControllerV2 } from './v2/lectures.controller'
import { LecturesServiceV2 } from './v2/lectures.service'

@Module({
  imports: [PrismaModule],
  controllers: [LecturesController, LecturesControllerV2],
  providers: [LecturesService, LecturesServiceV2],
  exports: [LecturesService],
})
export class LecturesModule {}
