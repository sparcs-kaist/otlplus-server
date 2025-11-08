import { SetMetadata } from '@nestjs/common'

export const USE_ELASTICSEARCH_API_KEY = 'useElasticsearchAPIKey'
export const ElasticsearchApiKeyAuth = () => SetMetadata(USE_ELASTICSEARCH_API_KEY, true)
