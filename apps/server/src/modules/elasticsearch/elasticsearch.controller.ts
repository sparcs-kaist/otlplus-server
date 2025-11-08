import { Controller, Post } from '@nestjs/common'
import { ApiSecurity, ApiTags } from '@nestjs/swagger'
import { ElasticsearchService } from '@otl/elasticsearch-client'
import { ElasticsearchApiKeyAuth } from '@otl/server-nest/common/decorators/elasticsearch-api-key-auth.decorator'

@ApiTags('Elasticsearch')
@Controller('api/elasticsearch')
export class ElasticsearchController {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  @Post('sync')
  @ApiSecurity('elasticsearchApiKey')
  @ElasticsearchApiKeyAuth()
  async syncCourses() {
    await this.elasticsearchService.syncAllCourses()
    return { message: 'Elasticsearch sync completed successfully' }
  }
}
