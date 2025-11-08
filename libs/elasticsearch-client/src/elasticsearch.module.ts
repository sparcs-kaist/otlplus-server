import { DynamicModule, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { ELASTICSEARCH_CONFIG, ElasticsearchConfig } from './elasticsearch.config'
import { ElasticsearchService } from './elasticsearch.service'

@Module({})
export class ElasticsearchModule {
  static register(config: ElasticsearchConfig): DynamicModule {
    return {
      module: ElasticsearchModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: ELASTICSEARCH_CONFIG,
          useValue: config,
        },
        ElasticsearchService,
      ],
      exports: [ElasticsearchService],
    }
  }
}
