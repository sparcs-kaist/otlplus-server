import { Module } from '@nestjs/common'
import { RmqConnectionModule } from '@otl/rmq'
import { TakenLectureService } from '@otl/server-consumer/modules/takenLecture/takenLecture.service'
import { TAKENLECTURE_REPOSITORY } from '@otl/server-consumer/out/ServerConsumerTakenLectureRepository'

import { PrismaModule, SyncRepository } from '@otl/prisma-client'

@Module({
  imports: [PrismaModule, RmqConnectionModule.register()],
  providers: [
    {
      provide: TAKENLECTURE_REPOSITORY,
      useClass: SyncRepository,
    },
    TakenLectureService,
  ],
  controllers: [],
  exports: [TakenLectureService],
})
export class TakenLecture {}
