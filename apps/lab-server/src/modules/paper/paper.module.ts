import { Module } from '@nestjs/common'
import { PAPER_REPOSITORY } from '@otl/lab-server/modules/paper/domain/paper.repository'
import { PaperController } from '@otl/lab-server/modules/paper/paper.controller'
import { PaperService } from '@otl/lab-server/modules/paper/paper.service'
import { WeaviateModule } from '@otl/weaviate-client'
import { PaperWeaviateRepository } from '@otl/weaviate-client/repositories/paper.weaviate.repository'

import { PrismaModule } from '@otl/prisma-client'

@Module({
  imports: [WeaviateModule, PrismaModule],
  controllers: [PaperController],
  providers: [
    {
      provide: PAPER_REPOSITORY,
      useClass: PaperWeaviateRepository,
    },
    PaperService,
  ],
  exports: [PaperService],
})
export class PaperModule {}
