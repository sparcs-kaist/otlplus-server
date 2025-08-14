import { Module } from '@nestjs/common'
import { FIELD_REPOSITORY } from '@otl/lab-server/modules/field/domain/field.repository'
import { FieldController } from '@otl/lab-server/modules/field/field.controller'
import { FieldService } from '@otl/lab-server/modules/field/field.service'
import { WeaviateModule } from '@otl/weaviate-client'
import { FieldWeaviateRepository } from '@otl/weaviate-client/repositories/field.weaviate.repository'

import { PrismaModule } from '@otl/prisma-client'

@Module({
  imports: [WeaviateModule, PrismaModule],
  controllers: [FieldController],
  providers: [
    FieldService,
    {
      provide: FIELD_REPOSITORY,
      useClass: FieldWeaviateRepository,
    },
  ],
  exports: [FieldService],
})
export class FieldModule {}
