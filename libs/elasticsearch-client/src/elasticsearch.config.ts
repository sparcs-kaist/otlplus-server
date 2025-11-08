export interface ElasticsearchConfig {
  node: string
  auth?: {
    username: string
    password: string
  }
  tls?: boolean
  apiKey?: string
}

export const ELASTICSEARCH_CONFIG = 'ELASTICSEARCH_CONFIG'
