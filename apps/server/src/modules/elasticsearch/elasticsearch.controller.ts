import { Controller, Post } from '@nestjs/common'
import { ApiSecurity, ApiTags } from '@nestjs/swagger'
import { ElasticsearchApiKeyAuth } from '@otl/server-nest/common/decorators/elasticsearch-api-key-auth.decorator'

import { ElasticsearchSchedule } from './elasticsearch.schedule'

@ApiTags('Elasticsearch')
@Controller('api/elasticsearch')
export class ElasticsearchController {
  constructor(private readonly elasticsearchSchedule: ElasticsearchSchedule) {}

  // manual sync of elasticsearch indexes
  // through sending request with API key to this endpoint
  @Post('sync')
  @ApiSecurity('elasticsearchApiKey')
  @ElasticsearchApiKeyAuth()
  async syncCourses() {
    await this.elasticsearchSchedule.syncCourses()
    return { message: 'Elasticsearch sync completed successfully' }
  }
}
