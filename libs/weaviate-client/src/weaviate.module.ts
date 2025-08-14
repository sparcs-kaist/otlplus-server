import { DynamicModule, Global, Module } from '@nestjs/common'
import { WeaviateModuleConfig } from '@otl/lab-server/common/interfaces/IWeaviate'

import { WeaviateService } from './weaviate.service'

@Module({})
@Global()
export class WeaviateModule {
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
}
