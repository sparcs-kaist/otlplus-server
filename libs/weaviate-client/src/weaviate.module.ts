import { DynamicModule, Module, OnModuleInit } from '@nestjs/common'
import { WeaviateModuleConfig } from '@otl/lab-server/common/interfaces/IWeaviate'

import { WeaviateService } from './weaviate.service'

@Module({})
export class WeaviateModule implements OnModuleInit {
  static register(config: WeaviateModuleConfig): DynamicModule {
    return {
      module: WeaviateModule,
      providers: [
        {
          provide: 'ConnectToCustomOptions',
          useValue: config.weaviateConfig,
        },
        WeaviateService,
      ],
      exports: [WeaviateService],
    }
  }

  constructor(private readonly weaviate: WeaviateService) {}

  onModuleInit() {}
}
