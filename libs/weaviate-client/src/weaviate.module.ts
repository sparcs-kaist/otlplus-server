import { DynamicModule, Module } from '@nestjs/common'
import { ConnectToCustomOptions } from 'weaviate-client'

import { WeaviateService } from './weaviate.service'

@Module({})
export class WeaviateModule {
  static register(config: ConnectToCustomOptions): DynamicModule {
    return {
      module: WeaviateModule,
      providers: [
        {
          provide: 'ConnectToCustomOptions',
          useValue: config,
        },
        WeaviateService,
      ],
      exports: [WeaviateService],
    }
  }

  constructor(private readonly weaviate: WeaviateModule) {}

  onModuleInit() {}
}
