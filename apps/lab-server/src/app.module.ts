import { Module } from '@nestjs/common'
import { WeaviateModule } from '@otl/weaviate-client'

import settings from './settings'

@Module({
  imports: [WeaviateModule.register(settings().weaviateConfig())],
})
export class AppModule {}
