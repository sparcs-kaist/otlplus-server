import { Module } from '@nestjs/common'
import { ElasticsearchModule as ElasticsearchClientModule } from '@otl/elasticsearch-client'
import settings from '@otl/server-nest/settings'

import { ElasticsearchController } from './elasticsearch.controller'
import { ElasticsearchSchedule } from './elasticsearch.schedule'
import { ElasticsearchService } from './elasticsearch.service'

@Module({
  imports: [ElasticsearchClientModule.register(settings().getElasticsearchConfig())],
  controllers: [ElasticsearchController],
  providers: [ElasticsearchSchedule, ElasticsearchService],
  exports: [ElasticsearchService],
})
export class ElasticsearchModule {}
