import { Module } from '@nestjs/common'
import { LabController } from '@otl/lab-server/modules/lab/lab.controller'
import { LabService } from '@otl/lab-server/modules/lab/lab.service'
import { WeaviateModule } from '@otl/weaviate-client'

@Module({
  imports: [WeaviateModule],
  controllers: [LabController],
  providers: [LabService],
  exports: [LabService],
})
export class LabModule {}
