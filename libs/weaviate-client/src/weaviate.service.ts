import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import { ConnectToCustomOptions, WeaviateClient } from 'weaviate-client'

import { createWeaviateClient } from './weaviate.factory'

@Injectable()
export class WeaviateService implements OnModuleInit {
  public client!: WeaviateClient

  constructor(
    @Inject('ConnectToCustomOptions')
    private readonly config: ConnectToCustomOptions,
  ) {}

  async onModuleInit() {
    this.client = await createWeaviateClient(this.config)
  }
}
