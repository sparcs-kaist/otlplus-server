import { Module } from '@nestjs/common'
import { PaperController } from '@otl/lab-server/modules/paper/paper.controller'
import { PaperService } from '@otl/lab-server/modules/paper/paper.service'
import { WeaviateModule } from '@otl/weaviate-client'

@Module({
  imports: [WeaviateModule],
  controllers: [PaperController],
  providers: [PaperService],
  exports: [PaperService],
})
export class PaperModule {}
