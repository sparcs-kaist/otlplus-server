import weaviate, { ConnectToCustomOptions, WeaviateClient } from 'weaviate-client'

export async function createWeaviateClient(config: ConnectToCustomOptions): Promise<WeaviateClient> {
  return await weaviate.connectToCustom(config)
}
