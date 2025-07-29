import { Module } from '@nestjs/common'
import { FieldController } from '@otl/lab-server/modules/field/field.controller'
import { FieldService } from '@otl/lab-server/modules/field/field.service'
import { WeaviateModule } from '@otl/weaviate-client'

@Module({
  imports: [WeaviateModule],
  controllers: [FieldController],
  providers: [FieldService],
  exports: [FieldService],
})
export class FieldModule {}
