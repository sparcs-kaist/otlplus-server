import { DynamicModule, Module } from '@nestjs/common'

import { WeaviateService } from './weaviate.service'

@Module({})
export class WeaviateModule {
  static register(): DynamicModule {
    return {
      module: WeaviateModule,
      providers: [WeaviateService],
      exports: [WeaviateService],
    }
  }
}
