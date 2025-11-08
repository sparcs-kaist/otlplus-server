import { Module } from '@nestjs/common'
import { ElasticsearchModule as ElasticsearchClientModule } from '@otl/elasticsearch-client'
import settings from '@otl/server-nest/settings'

import { ElasticsearchController } from './elasticsearch.controller'

@Module({
  imports: [ElasticsearchClientModule.register(settings().getElasticsearchConfig())],
  controllers: [ElasticsearchController],
})
export class ElasticsearchModule {}
