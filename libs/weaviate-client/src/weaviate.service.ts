import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import { ConnectToCustomOptions, WeaviateClient } from 'weaviate-client'

import { createWeaviateClient } from './weaviate.factory'

@Injectable()
export class WeaviateService implements OnModuleInit {
  private readonly client: Promise<WeaviateClient>

  constructor(@Inject('ConnectToCustomOptions') config: ConnectToCustomOptions) {
    this.client = createWeaviateClient(config)
  }

  async onModuleInit() {
    Object.assign(this, await this.client)
  }
}
