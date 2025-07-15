import { Module } from '@nestjs/common'
import { LabController } from '@otl/server-nest/modules/lab/lab.controller'
import { LabService } from '@otl/server-nest/modules/lab/lab.service'
import { WeaviateModule } from '@otl/weaviate-client/weaviate.module'

@Module({
  imports: [WeaviateModule.register()],
  controllers: [LabController],
  providers: [LabService],
  exports: [LabService],
})
export class LabModule {}
