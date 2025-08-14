import { Module } from '@nestjs/common'
import { LAB_REPOSITORY } from '@otl/lab-server/modules/lab/domain/lab.repository'
import { LabController } from '@otl/lab-server/modules/lab/lab.controller'
import { LabService } from '@otl/lab-server/modules/lab/lab.service'
import { WeaviateModule } from '@otl/weaviate-client'
import { LabWeaviateRepository } from '@otl/weaviate-client/repositories/lab.weaviate.repository'

import { PrismaModule } from '@otl/prisma-client'

@Module({
  imports: [WeaviateModule, PrismaModule],
  controllers: [LabController],
  providers: [
    {
      provide: LAB_REPOSITORY,
      useClass: LabWeaviateRepository,
    },
    LabService,
  ],
  exports: [LabService],
})
export class LabModule {}
