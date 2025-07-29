import { ConnectToCustomOptions } from 'weaviate-client'

export interface WeaviateModuleConfig {
  weaviateConfig: ConnectToCustomOptions
  geminiConfig: string
}
