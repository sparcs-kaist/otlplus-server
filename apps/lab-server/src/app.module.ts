import { Module } from '@nestjs/common'
import { WeaviateModule } from '@otl/weaviate-client'

@Module({
  imports: [WeaviateModule.register()],
})
export class AppModule {}
