import { Module } from '@nestjs/common'
import { AppController } from '@otl/lab-server/app.controller'
import { AppService } from '@otl/lab-server/app.service'
import { WeaviateModule } from '@otl/weaviate-client'

import settings from './settings'

@Module({
  imports: [WeaviateModule.register(settings().weaviateConfig())],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
