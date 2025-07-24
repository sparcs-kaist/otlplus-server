import { Module } from '@nestjs/common'
import settings from '@otl/lab-server/settings'
import { LabController } from '@otl/server-nest/modules/lab/lab.controller'
import { LabService } from '@otl/server-nest/modules/lab/lab.service'
import { WeaviateModule } from '@otl/weaviate-client/weaviate.module'

@Module({
  imports: [WeaviateModule.register(settings().weaviateConfig())],
  controllers: [LabController],
  providers: [LabService],
  exports: [LabService],
})
export class LabModule {}
